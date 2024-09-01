import os
import json
import numpy as np
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient
import google.generativeai as genai
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from io import BytesIO
from statistics import mean
import re
import logging
import pdfplumber
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
# Configure Azure Blob Storage
connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
blob_service_client = BlobServiceClient.from_connection_string(connection_string)
container_name = "loanapplications"

# Ensure the container exists or create it if it doesn't
container_client = blob_service_client.get_container_client(container_name)
if not container_client.exists():
    container_client.create_container()

# Configure Google Generative AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Your Finnhub API key
finnhub_api_key = os.getenv("FINNHUB_API_KEY")

# Define the sectors with the top 20 companies listed
sectors = {
    'IT': {
        'Apple': 'AAPL', 'Microsoft': 'MSFT', 'Google': 'GOOGL', 'Amazon': 'AMZN',
        'Facebook': 'META', 'IBM': 'IBM', 'Oracle': 'ORCL', 'Intel': 'INTC',
        'Cisco': 'CSCO', 'Adobe': 'ADBE', 'Salesforce': 'CRM', 'SAP': 'SAP',
        'HP': 'HPQ', 'Dell': 'DELL', 'Nvidia': 'NVDA', 'AMD': 'AMD',
        'Twitter': 'TWTR', 'Uber': 'UBER', 'Lyft': 'LYFT', 'Snap': 'SNAP'
    },
    'Automobile': {
        'Tesla': 'TSLA', 'Toyota': 'TM', 'Ford': 'F', 'BMW': 'BMWYY', 'General Motors': 'GM',
        'Honda': 'HMC', 'Mercedes-Benz': 'DDAIF', 'Audi': 'AUDVF', 'Volkswagen': 'VWAGY',
        'Nissan': 'NSANY', 'Hyundai': 'HYMTF', 'Ferrari': 'RACE', 'Porsche': 'POAHY',
        'Lamborghini': 'LMC', 'Jaguar': 'TTM', 'Kia': 'KIMTF', 'Mazda': 'MZDAY',
        'Subaru': 'FUJHY', 'Volvo': 'VOLV-B.ST'
    },
    'Pharma': {
        'Pfizer': 'PFE', 'Moderna': 'MRNA', 'Johnson & Johnson': 'JNJ', 'AstraZeneca': 'AZN',
        'Merck': 'MRK', 'Novartis': 'NVS', 'Sanofi': 'SNY', 'GlaxoSmithKline': 'GSK',
        'Bristol-Myers Squibb': 'BMY', 'AbbVie': 'ABBV', 'Eli Lilly': 'LLY', 'Roche': 'RHHBY',
        'Amgen': 'AMGN', 'Bayer': 'BAYRY', 'Gilead Sciences': 'GILD', 'Biogen': 'BIIB',
        'Regeneron': 'REGN', 'Vertex Pharmaceuticals': 'VRTX', 'Alnylam Pharmaceuticals': 'ALNY',
        'Alexion Pharmaceuticals': 'ALXN'
    },
    'Finance': {
        'JPMorgan Chase': 'JPM', 'Bank of America': 'BAC', 'Wells Fargo': 'WFC', 'Citigroup': 'C',
        'Goldman Sachs': 'GS', 'Morgan Stanley': 'MS', 'HSBC': 'HSBC', 'Barclays': 'BCS',
        'UBS': 'UBS', 'BNP Paribas': 'BNPQY', 'Deutsche Bank': 'DB', 'Credit Suisse': 'CS',
        'Santander': 'SAN', 'BBVA': 'BBVA', 'American Express': 'AXP', 'Capital One': 'COF',
        'Charles Schwab': 'SCHW', 'BlackRock': 'BLK', 'Fidelity Investments': 'FNF',
        'State Street': 'STT'
    },
    'FMCG': {
        'Procter & Gamble': 'PG', 'Unilever': 'UL', 'Coca-Cola': 'KO', 'PepsiCo': 'PEP',
        'Nestle': 'NSRGY', 'Colgate-Palmolive': 'CL', 'Kraft Heinz': 'KHC', 'Mondelez': 'MDLZ',
        'Johnson & Johnson': 'JNJ', 'L\'Oreal': 'LRLCY', 'Reckitt Benckiser': 'RBGLY',
        'Kimberly-Clark': 'KMB', 'General Mills': 'GIS', 'Danone': 'DANOY', 'Estee Lauder': 'EL',
        'Mars': 'MARS', 'Hershey': 'HSY', 'Kellogg': 'K', 'Conagra Brands': 'CAG', 'Tyson Foods': 'TSN'
    } 
}

def upload_to_azure(file_data, folder_name, filename):
    blob_client = container_client.get_blob_client(f"{folder_name}/{filename}")
    blob_client.upload_blob(file_data, overwrite=True)
    return f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{folder_name}/{filename}"

def save_json_to_azure(data, folder_name, filename):
    if isinstance(data, dict) or isinstance(data, list):
        data = json.dumps(data).encode('utf-8')
    blob_client = container_client.get_blob_client(f"{folder_name}/{filename}")
    blob_client.upload_blob(data, overwrite=True)

def get_gemini_text_response(input_prompt):
    model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type":"application/json"})
    response = model.generate_content([input_prompt])
    return response.text  # Extract the content as text

def get_pdf_text(pdf_doc):
    text = ""
    pdf_reader = PdfReader(pdf_doc)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context, make sure to provide all the details, if the answer is not in
    provided context just say, "answer is not available in the context", don't provide the wrong answer\n\n
    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """
    model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    return chain

def extract_data_from_pdf(pdf_doc, questions):
    raw_text = get_pdf_text(pdf_doc)
    text_chunks = get_text_chunks(raw_text)
    get_vector_store(text_chunks)

    extracted_data = {}
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search("")

    chain = get_conversational_chain()
    for key, question in questions.items():
        response = chain({"input_documents": docs, "question": question}, return_only_outputs=True)
        extracted_data[key] = response["output_text"]

    return extracted_data

def get_gemini_image_response(input_prompt, image):
    model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
    response = model.generate_content([input_prompt, image[0]])
    return response.text  # Extract the content as text

def input_image_setup(uploaded_file):
    if uploaded_file:
        bytes_data = uploaded_file.read()
        image_parts = [
            {
                "mime_type": uploaded_file.content_type,
                "data": bytes_data
            }
        ]
        return image_parts
    else:
        raise FileNotFoundError("No file uploaded")

def fetch_news(symbol):
    """ Fetch the latest market news for a given company symbol using Finnhub """
    url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from=2023-01-01&to=2023-12-31&token={finnhub_api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return []

def fetch_stock_price(symbol):
    """ Fetch the current stock price for a given company symbol using Finnhub """
    url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={finnhub_api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('c', None)  # Return the current price
    else:
        return None

def analyze_sentiment(news_items):
    """ Perform simple lexicon-based sentiment analysis on the aggregated news headlines """
    sentiment_scores = []
    positive_words = set(["good", "great", "positive", "up", "increase", "growth", "success", "gain", "profit", "benefit"])
    negative_words = set(["bad", "poor", "negative", "down", "decrease", "loss", "failure", "decline", "deficit", "risk"])
    
    for item in news_items:
        headline = item['headline'].lower()
        pos_count = sum(word in positive_words for word in headline.split())
        neg_count = sum(word in negative_words for word in headline.split())
        sentiment_score = pos_count - neg_count
        sentiment_scores.append(sentiment_score)
    return sentiment_scores

def predict_investment_future(avg_stock_price, avg_sentiment, years):
    """ Simple prediction model to assess if the sector is good for investment in the future """
    growth_factor = 1 + (avg_sentiment / 10)  # Sentiment adjusted growth factor
    projected_price = avg_stock_price * (growth_factor ** years)
    roi = ((projected_price - avg_stock_price) / avg_stock_price) * 100  # Return on Investment in percentage
    return roi

def analyze_and_format_sector_output(sector, symbols):
    """ Fetch and format the sector analysis for inclusion in the Gemini prompt """
    all_news_items = []
    sector_prices = []
    sector_analysis = f"Analysis for {sector} Sector:\n"
    
    for company, symbol in symbols.items():
        news_items = fetch_news(symbol)
        stock_price = fetch_stock_price(symbol)
        if stock_price is not None:
            sector_prices.append(stock_price)
        all_news_items.extend(news_items)  # Aggregate all news for the sector
    
    if all_news_items:
        sector_sentiments = analyze_sentiment(all_news_items)
        total_sentiment_score = sum(sector_sentiments)
        avg_sentiment = total_sentiment_score / len(sector_sentiments)
        sector_analysis += f"  - Total Sentiment Score: {total_sentiment_score}\n"
        sector_analysis += f"  - Average Sentiment Score: {avg_sentiment:.2f}\n"
    else:
        avg_sentiment = 0
        sector_analysis += "  - No news available for this sector.\n"
    
    if sector_prices:
        avg_stock_price = mean(sector_prices)
        sector_analysis += f"  - Average Stock Price: ${avg_stock_price:.2f}\n"
    else:
        avg_stock_price = 0
        sector_analysis += "  - No stock price data available for this sector.\n"
    
    # Lending recommendation
    lending_recommendation = 'Good' if avg_sentiment > 0 and avg_stock_price > 100 else 'Risky'
    sector_analysis += f"  - Lending Recommendation: {lending_recommendation}\n"

    # Investment predictions
    for years in [5, 10, 15]:
        roi = predict_investment_future(avg_stock_price, avg_sentiment, years)
        sector_analysis += f"  - Projected ROI in {years} years: {roi:.2f}%\n"
        if roi > 0:
            sector_analysis += f"  - Investment Recommendation for {years} years: Good\n"
        else:
            sector_analysis += f"  - Investment Recommendation for {years} years: Risky\n"
    
    return sector_analysis

def secure_validate_gstin(gstin):
    # Setup logging (optional)
    logging.basicConfig(filename='gstin_validation.log', level=logging.INFO)

    # Sanitize input
    gstin = gstin.strip().upper()  # Convert to uppercase and strip whitespace

    # Character place value dictionary for checksum calculation
    place_value = {}
    integers = '0123456789'
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    for count, char in enumerate(integers):
        place_value[char] = count
    
    for count, char in enumerate(characters, start=10):
        place_value[char] = count

    # State codes dictionary
    state_codes = {
        '01': 'JAMMU AND KASHMIR', '20': 'JHARKHAND', '02': 'HIMACHAL PRADESH', '21': 'ODISHA',
        '03': 'PUNJAB', '22': 'CHATTISGARH', '04': 'CHANDIGARH', '23': 'MADHYA PRADESH',
        '05': 'UTTARAKHAND', '24': 'GUJARAT', '06': 'HARYANA', '25': 'DAMAN AND DIU',
        '07': 'DELHI', '26': 'DADRA AND NAGAR HAVELI', '08': 'RAJASTHAN', '27': 'MAHARASHTRA',
        '09': 'UTTAR PRADESH', '28': 'ANDHRA PRADESH (old)', '10': 'BIHAR', '29': 'KARNATAKA',
        '11': 'SIKKIM', '30': 'GOA', '12': 'ARUNACHAL PRADESH', '31': 'LAKSHWADEEP',
        '13': 'NAGALAND', '32': 'KERALA', '14': 'MANIPUR', '33': 'TAMIL NADU',
        '15': 'MIZORAM', '34': 'PUDUCHERRY', '16': 'TRIPURA',
        '35': 'ANDAMAN AND NICOBAR ISLANDS', '17': 'MEGHLAYA', '36': 'TELANGANA',
        '18': 'ASSAM', '37': 'ANDHRA PRADESH (NEW)', '19': 'WEST BENGAL'
    }

    try:
        # Check if GSTIN is 15 characters long
        if len(gstin) != 15:
            raise ValueError("Invalid length. GSTIN must be 15 characters long.")

        # Check if the first two characters are a valid state code
        state_code = gstin[:2]
        if state_code not in state_codes:
            raise ValueError("Invalid state code.")

        # Regular expression to validate PAN format (3rd to 12th characters)
        pan_format = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]$')
        if not pan_format.match(gstin[2:12]):
            raise ValueError("Invalid PAN format.")

        # Check if the 13th character is a digit
        if not gstin[12].isdigit():
            raise ValueError("Invalid entity number (13th character).")

        # Check if the 14th character is 'Z'
        if gstin[13] != 'Z':
            raise ValueError("Invalid 14th character. Must be 'Z'.")

        # Checksum calculation (15th character)
        odd_sum = 0
        even_sum = 0
        for index in range(0, 14, 2):
            odd_sum += place_value[gstin[index]]
        
        for index in range(1, 14, 2):
            even_value = place_value[gstin[index]] * 2
            even_sum += even_value // 36 + even_value % 36

        total = odd_sum + even_sum
        checksum_value = (36 - (total % 36)) % 36
        
        # Fix the index issue, use the correct modulo base
        if checksum_value < 10:
            checksum_char = str(checksum_value)
        else:
            checksum_char = characters[checksum_value - 10]

        if gstin[14] != checksum_char:
            raise ValueError("Invalid GSTIN checksum.")

        # Log the successful validation
        logging.info(f"GSTIN {gstin} is valid.")
        return True, "GSTIN is valid."

    except ValueError as ve:
        # Log the failure with details
        logging.warning(f"GSTIN {gstin} validation failed: {str(ve)}")
        return False, str(ve)

    except Exception as e:
        # General catch-all for any unexpected errors
        logging.error(f"GSTIN {gstin} validation encountered an error: {str(e)}")
        return False, "An error occurred during GSTIN validation."

def validate_ifsc(ifsc):
    # Setup logging (optional)
    logging.basicConfig(filename='ifsc_validation.log', level=logging.INFO)

    # Sanitize input
    ifsc = ifsc.strip().upper()  # Convert to uppercase and strip whitespace

    # Regular expression to validate IFSC format
    ifsc_pattern = re.compile(r'^[A-Z]{4}0[A-Z0-9]{6}$')

    try:
        # Check if IFSC matches the required pattern
        if not ifsc_pattern.match(ifsc):
            raise ValueError("Invalid IFSC format. It should be 11 characters: first 4 letters, 5th character '0', followed by 6 alphanumeric characters.")

        # If valid, log the validation
        logging.info(f"IFSC {ifsc} is valid.")
        return True, "IFSC is valid."

    except ValueError as ve:
        # Log the failure with details
        logging.warning(f"IFSC {ifsc} validation failed: {str(ve)}")
        return False, str(ve)

    except Exception as e:
        # General catch-all for any unexpected errors
        logging.error(f"IFSC {ifsc} validation encountered an error: {str(e)}")
        return False, "An error occurred during IFSC validation."


# Bank statement analysis functions (applies to both business and personal loans)
def extract_transactions_from_pdf(pdf_path):
    """Extracts transaction data from the structured PDF and returns it as a list of dictionaries."""
    transactions = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_table()
            if tables:
                for row in tables[1:]:  # Skip the header row
                    date, description, amount, balance = row
                    
                    # Sanitize and convert the amount and balance strings
                    amount_value = float(re.sub(r'[^\d.-]', '', amount))
                    balance_value = float(re.sub(r'[^\d.-]', '', balance))
                    
                    transactions.append({
                        'Date': pd.to_datetime(date),
                        'Description': description,
                        'Amount': amount_value,
                        'Balance': balance_value
                    })

    return transactions


def categorize_spending(description):
    """Categorizes spending into essentials, non-essentials, and savings/investments."""
    essentials_keywords = ["rent", "groceries", "utilities", "insurance"]
    savings_investments_keywords = ["investment", "savings", "deposit"]
    
    description_lower = description.lower()
    
    if any(keyword in description_lower for keyword in essentials_keywords):
        return "essentials"
    elif any(keyword in description_lower for keyword in savings_investments_keywords):
        return "savings_investments"
    else:
        return "non_essentials"

def analyze_transactions(transactions):
    """Analyzes the transactions to extract key insights."""
    df = pd.DataFrame(transactions)
    df['Month'] = df['Date'].dt.to_period('M')
    
    # Spending Habits
    df['Category'] = df['Description'].apply(categorize_spending)
    average_monthly_spending = df[df['Amount'] < 0].groupby('Month')['Amount'].sum().mean()
    spending_categories = df[df['Amount'] < 0].groupby('Category')['Amount'].sum().to_dict()
    deviations = df[df['Amount'] < 0].groupby('Month')['Amount'].sum()
    significant_deviations = deviations[abs(deviations - deviations.mean()) > 2 * deviations.std()].index.tolist()
    
    # Income Consistency
    income_df = df[df['Amount'] > 0]
    regularity = "consistent" if income_df.groupby('Month')['Amount'].sum().std() < income_df['Amount'].mean() * 0.2 else "irregular"
    primary_sources = income_df['Description'].value_counts().index.tolist()
    irregular_income = income_df.groupby('Month')['Amount'].sum()
    irregularities = irregular_income[abs(irregular_income - irregular_income.mean()) > 2 * irregular_income.std()].index.tolist()

    # Irregular Transactions
    mean_expense = df[df['Amount'] < 0]['Amount'].mean()
    std_expense = df[df['Amount'] < 0]['Amount'].std()
    irregular_transactions = df[(df['Amount'] < 0) & (df['Amount'] < mean_expense - 2 * std_expense)]
    irregular_transactions_list = irregular_transactions[['Date', 'Description', 'Amount']].to_dict(orient='records')

    # Savings and Investments
    savings_df = df[df['Category'] == 'savings_investments']
    savings_consistency = "consistent" if savings_df.groupby('Month')['Amount'].sum().std() < abs(savings_df['Amount'].mean()) * 0.2 else "irregular"
    balance_growth = df.groupby('Month')['Balance'].last().pct_change().mean()
    balance_growth_description = "increasing" if balance_growth > 0 else "decreasing" if balance_growth < 0 else "stable"
    significant_withdrawals = savings_df[savings_df['Amount'] < savings_df['Amount'].mean() - 2 * savings_df['Amount'].std()]
    significant_withdrawals_list = significant_withdrawals[['Date', 'Description', 'Amount']].to_dict(orient='records')

    # Debt Payments
    debt_keywords = ["loan", "credit card", "emi", "mortgage"]
    debt_df = df[df['Description'].str.contains('|'.join(debt_keywords), case=False, na=False)]
    debt_regular = "regular" if debt_df.groupby('Month')['Amount'].count().std() < 2 else "irregular"
    missed_or_late_payments = debt_df[debt_df['Amount'] > 0]  # Assuming positive amounts in debt indicate missed payments

    # Liquidity and Cash Flow
    average_balance = df['Balance'].mean()
    cash_flow_pattern = "consistent" if df.groupby('Month')['Amount'].sum().std() < abs(df['Amount'].mean()) * 0.2 else "irregular"
    low_balance_months = df[df['Balance'] < average_balance * 0.5]['Month'].unique().tolist()

    # Expense-to-Income Ratio
    monthly_expense = df[df['Amount'] < 0].groupby('Month')['Amount'].sum()
    monthly_income = df[df['Amount'] > 0].groupby('Month')['Amount'].sum()
    expense_to_income_ratio = (monthly_expense / monthly_income).mean()
    sustainability = "sustainable" if expense_to_income_ratio < 0.7 else "risky" if expense_to_income_ratio < 1 else "unsustainable"

    # Financial Stability Indicators
    if balance_growth_description == "increasing" and regularity == "consistent" and cash_flow_pattern == "consistent" and sustainability == "sustainable":
        summary = "The applicant's financial behavior appears stable with consistent income, controlled spending, and growing savings."
    else:
        summary = "There are potential risks in the applicant's financial behavior, such as irregular income, inconsistent cash flow, or unsustainable expenses."

    # Compile all insights into a structured format
    insights = {
        "spending_habits": {
            "average_monthly_spending": f"${average_monthly_spending:,.2f}",
            "categories": {
                "essentials": f"${spending_categories.get('essentials', 0):,.2f}",
                "non_essentials": f"${spending_categories.get('non_essentials', 0):,.2f}",
                "savings_investments": f"${spending_categories.get('savings_investments', 0):,.2f}"
            },
            "significant_deviations": [str(deviation) for deviation in significant_deviations]
        },
        "income_consistency": {
            "regularity": regularity,
            "primary_sources": primary_sources,
            "irregularities": [str(irregularity) for irregularity in irregularities]
        },
        "irregular_transactions": irregular_transactions_list,
        "savings_investments": {
            "consistency": savings_consistency,
            "balance_growth": balance_growth_description,
            "significant_withdrawals": significant_withdrawals_list
        },
        "debt_payments": {
            "regularity": debt_regular,
            "missed_or_late_payments": missed_or_late_payments[['Date', 'Description', 'Amount']].to_dict(orient='records')
        },
        "liquidity_cash_flow": {
            "average_balance": f"${average_balance:,.2f}",
            "cash_flow_pattern": cash_flow_pattern,
            "low_balance_months": [str(month) for month in low_balance_months]
        },
        "expense_to_income_ratio": {
            "ratio": f"{expense_to_income_ratio:.2f}",
            "sustainability": sustainability
        },
        "financial_stability_indicators": {
            "summary": summary
        }
    }

    return insights

def analyze_multiple_pdfs(pdf_paths):
    """Analyzes multiple PDFs and returns insights for each in a structured format."""
    all_insights = {}
    
    for pdf_path in pdf_paths:
        if os.path.exists(pdf_path):
            transactions_list = extract_transactions_from_pdf(pdf_path)
            insights = analyze_transactions(transactions_list)
            all_insights[os.path.basename(pdf_path)] = insights
        else:
            all_insights[os.path.basename(pdf_path)] = "File not found."
    
    return all_insights


# Endpoint for processing individual loan applications
@app.route('/process-individual-loan', methods=['POST'])
def process_individual_loan():
    try:
        # Extract form data for individual loan
        applicant_name = request.form.get("applicantName")
        applicant_age = int(request.form.get("applicantAge"))
        annual_income = float(request.form.get("annualIncome"))
        loan_amount = float(request.form.get("loanAmount"))
        loan_purpose = request.form.get("loanPurpose")
        loan_type = request.form.get("loanType")
        loan_term = int(request.form.get("loanTerm"))
        cibil_score = int(request.form.get("cibilScore"))

        # Handle file uploads
        loan_application_file = request.files.get("loanApplication")
        bank_statement_file = request.files.get("bankStatement")

        # Initialize extracted_data
        extracted_data = {}

        # Store applicant data
        memo_id = "individual_memo_" + str(np.random.randint(1000, 9999))
        applicant_data = {
            "applicantName": applicant_name,
            "applicantAge": applicant_age,
            "annualIncome": annual_income,
            "loanAmount": loan_amount,
            "loanPurpose": loan_purpose,
            "loanType": loan_type,
            "loanTerm": loan_term,
            "cibilScore": cibil_score,
            "memo_id": memo_id
        }

        if loan_application_file:
            # Extract data from the Loan Application form PDF
            pdf_bytes = loan_application_file.read()
            pdf_filename = f"{applicant_name}_loan_application.pdf"
            upload_to_azure(BytesIO(pdf_bytes), memo_id, pdf_filename)

            # Define questions for individual loans
            questions = {
                "gender": "Fetch the Gender",
                "marital_status": "Fetch the Marital Status",
                "address": "Fetch the Address",
                "current_employer": "Fetch the Current Employer",
                "designation": "Fetch the Designation",
                "years_with_employer": "Fetch the Years with Current Employer",
                "employment_type": "Fetch the Employment Type",
                "annual_income": "Fetch the Annual Income",
                "repayment_mode": "Fetch the Repayment Mode",
                "existing_loans": "Fetch the Existing Loans",
                "monthly_emi_obligations": "Fetch the Monthly EMI Obligations"
            }
            extracted_data = extract_data_from_pdf(BytesIO(pdf_bytes), questions)
            applicant_data.update(extracted_data)

        # Generate Credit Memo
        credit_memo_prompt = f"""
            Act as a senior loan underwriter with over 20 years of experience in evaluating personal loan applications.
            Your task is to analyze the provided applicant data and generate a detailed credit memo.
            The analysis should cover the applicant's background, financial stability, loan feasibility, and overall creditworthiness.
            Your final recommendation should include a justification based on the data provided.

            Objective:

            Analyze the following details provided by the applicant:

            Personal Loan Description:
            Applicant Name: {applicant_name}
            Applicant Age: {applicant_age}
            Annual Income: {annual_income}
            Loan Amount: {loan_amount}
            Loan Purpose: {loan_purpose}
            Loan Type: {loan_type}
            Loan Term: {loan_term} months
            CIBIL Score: {cibil_score}

            Additional Details Extracted from Loan Application Form:
            {json.dumps(extracted_data, indent=4)}

            Tasks:

            1. Profile Overview: Provide a summary of the applicant's background.
            2. Financial Stability Assessment: Assess the applicant's financial stability by analyzing their annual income.
            3. Loan Feasibility Evaluation: Analyze the requested loan amount, purpose, and type.
            4. Creditworthiness Assessment: Evaluate the applicant’s CIBIL score.
            5. EMI Affordability Analysis: 
            - Ensure the proposed EMI does not exceed 40% of the applicant’s monthly income.
            - If the EMI is between 40-60% of the monthly income, provide a cautionary note indicating that while the loan may be feasible, it leaves limited room for other financial needs.
            - Highlight that ideally, the applicant should retain at least 60% of their monthly income for personal and family expenses.
            - If the EMI exceeds 60% of the monthly income, significantly reduce the profile score as this could indicate an unsustainable financial burden.
            6. Spending Pattern and Bank Statement Analysis:
            - Identify patterns in the applicant’s spending habits. If there are regular savings or a consistent surplus at the end of the month, increase the profile score.
            - Detect any irregularities, such as frequent large withdrawals or gambling transactions, which should reduce the profile score.
            - Ensure the income reflected in the bank statement matches the income declared in the loan application.
            - Check for regular payment of existing loans. Consistent payments indicate financial discipline and should positively influence the profile score.
            - Assess the average balance in the account. A consistently low balance may indicate financial strain, leading to a lower profile score.
            - Calculate if the proposed EMI constitutes more than 40% of the applicant’s average monthly inflow. If it does, suggest that the loan might not be affordable for the applicant and recommend a reduction in the loan amount or an extension of the loan tenure to reduce EMI.
            7. Final Profile Score Calculation:
            - Aggregate the scores from the Loan Application, Credit Score Report, and Bank Statement Analysis.
            - Provide a cumulative average to generate the final profile score.
            - Highlight areas of concern if the final profile score falls below a certain threshold (e.g., 6 out of 10).

            Final Recommendation: Provide a final recommendation on whether the loan should be approved, conditionally approved, or rejected.

            Please ensure that the output includes data specifically structured for income vs. expenditure analysis over the last six months for graphical representation.

            Please return the analysis in the following JSON format:
            json_string = 
            {{
            "applicant_details": {{
            "name": "aaditya",
            "age": 21,
            "gender": "Male",
            "marital_status": "Married",
            "occupation": "Salaried",
            "company": "Deloitte India",
            "employment_duration_years": 12,
            "annual_income": 100000.0,
            "loan_amount_requested": 1000000.0,
            "loan_purpose": "timepass",
            "loan_term_years": 1,
            "profile_score": 4,
            "profile_summary": "The applicant is young with limited credit history and a high loan amount requested, coupled with an unclear loan purpose, raising concerns about financial responsibility and the viability of the loan."
            }},
            "financial_analysis": {{
            "monthly_income": 8333.33,
            "monthly_expenses": "null",
            "monthly_emi_obligations": 12000,
            "cibil_score": 749,
            "creditworthiness": "Good",
            "debt_to_income_ratio": 144,
            "existing_loans": [
            {{
                "loan_type": "Education Loan",
                "loan_amount": 1000000
            }}
            ],
            "income_sources_verified": "False",
            "spending_pattern_analysis": "No spending patterns are available due to insufficient data.",
            "bank_statement_analysis": "The bank statement analysis reveals irregular income patterns, inconsistent cash flow, and a high debt-to-income ratio, indicating potential financial strain. The average account balance is high, but the low balance months suggest potential liquidity concerns.",
            "six_month_analysis": {{
            "months": [
                "March",
                "April",
                "May",
                "June",
                "July",
                "August"
            ],
            "income": [
                85000,
                87000,
                86000,
                88000,
                89000,
                90000
            ],
            "expenses": [
                65000,
                67000,
                66000,
                68000,
                69000,
                70000
            ],
            "graphical_representation": {{
                "income_vs_expense_graph": {{
                    "type": "line_chart",
                    "data": {{
                        "labels": [
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August"
                        ],
                        "datasets": [
                            {{
                                "label": "Income",
                                "data": [
                                    85000,
                                    87000,
                                    86000,
                                    88000,
                                    89000,
                                    90000
                                ]
                            }},
                            {{
                                "label": "Expenses",
                                "data": [
                                    65000,
                                    67000,
                                    66000,
                                    68000,
                                    69000,
                                    70000
                                ]
                            }}
                        ]
                    }}
                }}
            }}
            }}
            }},
            "risk_analysis": {{
            "risk_level": "High",
            "risk_factors": [
            "High debt-to-income ratio",
            "Unclear loan purpose",
            "Young age with limited credit history",
            "Potential financial strain indicated by bank statement analysis"
            ],
            "external_risk_factors": {{
            "economic_conditions": "Medium risk due to potential economic downturns.",
            "industry_risk": "Low risk as the technology sector is generally stable.",
            "personal_liabilities": "High risk due to existing large education loan.",
            "interest_rate_fluctuations": "High risk if interest rates increase.",
            "inflation_risk": "Medium risk due to potential inflation reducing purchasing power.",
            "geopolitical_risk": "Low risk in the current region.",
            "health_risk": "Moderate risk considering the applicant's age and lifestyle.",
            "family_dependents": "Medium risk due to dependents which could increase financial obligations.",
            "housing_market_risk": "Low risk as the housing market is currently stable.",
            "employment_volatility": "Low risk due to stable employment, but could increase with industry changes."
            }}
            }},
            "loan_evaluation": {{
            "loan_type": "home loan",
            "requested_amount": 1000000.0,
            "purpose_of_loan": "timepass",
            "feasibility_of_loan": "The loan amount is significantly high compared to the applicant's income and existing debt obligations.",
            "final_recommendation": "Rejected",
            "recommendation_reason": "The applicant's high debt-to-income ratio, unclear loan purpose, and inconsistencies in bank statements raise serious concerns about their ability to manage the loan repayment. The applicant's financial situation does not meet the lending criteria, and the loan application is therefore rejected."
            }}
            }}

            Return the json_string as a valid JSON object without syntax error.
            """

        try:
            # Bank Statement Analysis for Personal Loan
            if bank_statement_file:
                bank_statement_pdf = bank_statement_file.read()
                bank_statement_insights = analyze_transactions(extract_transactions_from_pdf(BytesIO(bank_statement_pdf)))

                # Add bank statement analysis to the credit memo prompt
                credit_memo_prompt += f"\n\nBank Statement Analysis:\n{json.dumps(bank_statement_insights, indent=4)}"

            credit_memo_response = get_gemini_text_response(credit_memo_prompt)
            save_json_to_azure(credit_memo_response, memo_id, "credit_memo.json")

            return jsonify({
                "status": "success",
                "message": "Credit Memo and files saved successfully in Azure Blob Storage.",
                "memo_id": memo_id
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"An error occurred while generating the credit memo: {e}"
            }), 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An error occurred while processing the individual loan application: {e}"
        }), 500

# Endpoint for processing business loan applications
@app.route('/process-business-loan', methods=['POST'])
def process_business_loan():
    try:
        # Extract form data for business loan
        company_name = request.form.get("companyName")
        loan_amount = (request.form.get("loanAmount"))
        loan_purpose = request.form.get("loanPurpose")
        annual_income = (request.form.get("annualIncome"))
        sector = request.form.get("sector")
        gstin = request.form.get("gstin")
        ifsc = request.form.get("ifsc")


        # Validate GSTIN
        gstin_valid, gstin_message = secure_validate_gstin(gstin)
        if not gstin_valid:
            return jsonify({
                "status": "error",
                "message": f"Invalid GSTIN: {gstin_message}"
            }), 400

        # Validate IFSC
        ifsc_valid, ifsc_message = validate_ifsc(ifsc)
        if not ifsc_valid:
            return jsonify({
                "status": "error",
                "message": f"Invalid IFSC: {ifsc_message}"
            }), 400

        # Handle file uploads
        loan_application_file = request.files.get("loanApplication")
        bank_statement_file = request.files.get("bankStatement")
        credit_score_certificate_file = request.files.get("creditScoreCertificate")

        # Initialize extracted_data
        extracted_data = {}

        # Store business data
        memo_id = "business_memo_" + str(np.random.randint(1000, 9999))
        business_data = {
            "companyName": company_name,
            "loanAmount": loan_amount,
            "loanPurpose": loan_purpose,
            "annualIncome": annual_income,
            "gstin": gstin,
            "ifsc": ifsc,
            "memo_id": memo_id
        }

        if loan_application_file:
            # Extract data from the Loan Application form PDF
            pdf_bytes = loan_application_file.read()
            pdf_filename = f"{company_name}_loan_application.pdf"
            upload_to_azure(BytesIO(pdf_bytes), memo_id, pdf_filename)

            # Define questions for business loans
            questions = {
                "global_ranking": "Fetch the Global Ranking of the company",
                "market_share": "Fetch the Market Share",
                "primary_industry": "Fetch the Primary Industry",
                "annual_revenue": "Fetch the Annual Revenue",
                "net_income": "Fetch the Net Income",
                "total_debt": "Fetch the Total Debt",
                "total_equity": "Fetch the Total Equity",
                "current_ratio": "Fetch the Current Ratio",
                "debt_to_equity_ratio": "Fetch the Debt-to-Equity Ratio",
                "roa": "Fetch the Return on Assets (ROA)",
                "roe": "Fetch the Return on Equity (ROE)",
            }
            extracted_data = extract_data_from_pdf(BytesIO(pdf_bytes), questions)
            business_data.update(extracted_data)

        # Perform Sector Analysis and capture the formatted output
        sector_analysis_output = ""
        if sector in sectors:
            sector_analysis_output = analyze_and_format_sector_output(sector, sectors[sector])
            
        # Generate Credit Memo
        
        def calculate_liquidity_ratios(current_assets, current_liabilities):
            current_ratio = current_assets / current_liabilities if current_liabilities else None
            return {'current_ratio': current_ratio}

        def calculate_profitability_ratios(net_income, revenue, total_assets):
            return_on_assets = net_income / total_assets if total_assets else None
            net_profit_margin = net_income / revenue if revenue else None
            return {'return_on_assets': return_on_assets, 'net_profit_margin': net_profit_margin}

        def calculate_leverage_ratios(total_debt, total_assets, total_equity):
            debt_to_assets = total_debt / total_assets if total_assets else None
            debt_to_equity = total_debt / total_equity if total_equity else None
            return {'debt_to_assets': debt_to_assets, 'debt_to_equity': debt_to_equity}

        def calculate_financial_ratios(financial_data):
            liquidity_ratios = calculate_liquidity_ratios(
                financial_data['current_assets'],
                financial_data['current_liabilities']
            )
            profitability_ratios = calculate_profitability_ratios(
                financial_data['net_income'],
                financial_data['revenue'],
                financial_data['total_assets']
            )
            leverage_ratios = calculate_leverage_ratios(
                financial_data['total_debt'],
                financial_data['total_assets'],
                financial_data['total_equity']
            )
            return {**liquidity_ratios, **profitability_ratios, **leverage_ratios}

        def calculate_risk_rating(current_ratio, debt_to_equity, return_on_assets):
            current_ratio_score = 3 if current_ratio > 2.0 else 2 if current_ratio >= 1.0 else 1
            debt_to_equity_score = 3 if debt_to_equity < 1.0 else 2 if debt_to_equity <= 2.0 else 1
            return_on_assets_score = 3 if return_on_assets > 0.10 else 2 if return_on_assets >= 0.05 else 1
            total_score = current_ratio_score + debt_to_equity_score + return_on_assets_score
            if total_score >= 8:
                rating = 'AAA'
            elif total_score >= 6:
                rating = 'AA'
            elif total_score >= 4:
                rating = 'A'
            elif total_score >= 2:
                rating = 'BBB'
            else:
                rating = 'BB'
            return rating

# Example Data Input
        user_input = {
            "company_name": "Innovatech Solutions Ltd.",
            "industry": "Business",
            "description": "Innovatech Solutions Ltd. is a leading software development firm specializing in bespoke enterprise software solutions. Founded in 2010, the company has steadily grown to become a notable player in the tech industry, servicing a diverse clientele across multiple sectors.",
            "loan_amount": "$100000",
            "loan_purpose": "Expansion",
            "profile_score": 7.82,
            "current_assets": 5000000,
            "current_liabilities": 2500000,
            "net_income": 800000,
            "revenue": 10000000,
            "total_assets": 7000000,
            "total_debt": 2000000,
            "total_equity": 5000000,
            "yearly_revenue": [5, 5.5, 6, 6.5, 7],  # Revenue in Millions for last 5 years
            "yearly_profit_margin": [20, 25, 22, 23, 24]  # Profit Margin in Percentage for last 5 years
        }

        # Perform Financial Ratio Calculations
        ratios = calculate_financial_ratios(user_input)

        # Calculate Risk Rating
        risk_rating = calculate_risk_rating(
            ratios['current_ratio'],
            ratios['debt_to_equity'],
            ratios['return_on_assets']
        )

# Construct JSON result
        credit_memo_prompt = f"""
            Act as a senior loan underwriter with over 20 years of experience in evaluating business loan applications.
            Your task is to analyze the provided company data and generate a detailed credit memo.
            The analysis should cover the company's financial stability, market position, loan feasibility, and overall creditworthiness.
            Your final recommendation should include a justification based on the data provided.

            Objective:

            Analyze the following details provided by the applicant:

            Business Loan Description:
            Company Name: {company_name}
            Industry: {extracted_data.get('primary_industry', 'N/A')}
            Annual Revenue: {extracted_data.get('annual_revenue', 'N/A')}
            Loan Amount: {loan_amount}
            Loan Purpose: {loan_purpose}
            Sector Analysis : {sector_analysis_output}

            Additional Details Extracted from Loan Application Form:
            {json.dumps(extracted_data, indent=4)}

            Additional Documents for Analysis:
            1. Bank Statement: Analyze the provided bank statement to evaluate the financial transactions, liquidity, and overall cash flow.
            2. Credit Score Certificate: Assess the creditworthiness of the company by reviewing the provided credit score certificate.

            Tasks:

            1. Profile Overview: Provide a summary of the company's background, including its years of operation, industry presence, and market position.
            2. Financial Stability Assessment: 
            - Assess the company's financial stability by analyzing its revenue, net income, and overall financial health.
            3. Loan Feasibility Evaluation: 
            - Evaluate the requested loan amount relative to the company's financial position and stated purpose.
            4. Creditworthiness Assessment: 
            - Calculate key financial ratios such as ROA, ROE, current ratio, and debt-to-equity ratio to determine the company's creditworthiness.
            - Use the provided credit score certificate to assess the credit risk associated with the company.
            5. Risk Rating Calculation:
            - Calculate the risk rating based on the financial ratios, overall financial health, and credit score.
            6. Collateral and Security Analysis: 
            - Analyze any collateral provided and its adequacy relative to the loan amount.
            7. Sector and Market Position Analysis: 
            - Provide an analysis of the company's market position and the competitive environment in its industry.
            8. Bank Statement Analysis:
            - Review the bank statement for irregular transactions, liquidity issues, and consistency in income and expenditure.
            - Evaluate whether the bank statement reflects the financial stability indicated in the loan application.
            9. Final Profile Score Calculation: 
            - Aggregate the scores from the financial analysis, creditworthiness assessment, sector analysis, and document analysis to generate a final profile score.
            - Highlight areas of concern if the final profile score falls below a certain threshold (e.g., 6 out of 10).

            Final Recommendation: Provide a final recommendation on whether the loan should be approved, conditionally approved, or rejected.

            Please return the analysis in the following JSON format:

            {{
            "company_details": {{
                "company_name": "string",
                "industry": "string",
                "description": "string",
                "annual_revenue": "string",
                "loan_amount_requested": "string",
                "loan_purpose": "string",
                "profile_score": number,
                "profile_overview": "string"
            }},
            "financial_analysis": {{
                "revenue": "string",
                "net_income": "string",
                "total_assets": "string",
                "total_debt": "string",
                "total_equity": "string",
                "financial_ratios": {{
                "current_ratio": "string",
                "debt_to_equity": "string",
                "return_on_assets": "string",
                "return_on_equity": "string"
                }},
                "historical_financial_analysis": {{
                "revenue": {{
                    "years": ["2019", "2020", "2021", "2022", "2023"],
                    "values": "[number,number,number,number,number]",
                    "unit": "Millions"
                }},
                "profit_margin": {{
                    "years": ["2019", "2020", "2021", "2022", "2023"],
                    "values": "[number,number,number,number,number]",
                    "unit": "Percentage"
                }}
                }},
                "bank_statement_analysis": "Detailed analysis of the company's bank statement",
                "credit_score_analysis": "Assessment based on the provided credit score certificate"
            }},
            "risk_analysis": {{
                "risk_level": "string",
                "risk_factors": [
                "string"
                ],
                "external_risk_factors": {{
                "market_competition": {{
                    "level": "string",
                    "description": "string"
                }},
                "regulatory_changes": {{
                    "level": "string",
                    "description": "string"
                }},
                "economic_factors": {{
                    "level": "string",
                    "description": "string"
                }}
                }}
            }},
            "collateral_and_security_analysis": {{
                "collateral_value": "string",
                "adequacy": "string"
            }},
            "sector_and_market_position_analysis": {{
                "market_share": "string",
                "growth_rate": "string",
                "competition_level": "string"
            }},
            "final_profile_score_calculation": {{
                "cumulative_profile_score": "number",
                "final_recommendation": "string",
                "recommendation_reason": "string"
            }},
            "executive_summary": {{
                "button_text": "Download",
                "url": "link_to_download"
            }}
            }}

            Example Output:

            {{
            "company_details": {{
                "company_name": "Innovatech Solutions Ltd.",
                "industry": "Software Development",
                "description": "Innovatech Solutions Ltd. is a leading software development firm specializing in bespoke enterprise software solutions. Founded in 2010, the company has steadily grown to become a notable player in the tech industry, servicing a diverse clientele across multiple sectors.",
                "annual_revenue": "10,000,000",
                "loan_amount_requested": "100,000",
                "loan_purpose": "Expansion",
                "profile_score": "8.2",
                "profile_overview": "The company is a well-established firm with a strong presence in the tech industry and a solid track record of financial performance."
            }},
            "financial_analysis": {{
                "revenue": "10,000,000",
                "net_income": "800,000",
                "total_assets": "7,000,000",
                "total_debt": "2,000,000",
                "total_equity": "5,000,000",
                "financial_ratios": {{
                "current_ratio": "2.0",
                "debt_to_equity": "0.4",
                "return_on_assets": "11.4%",
                "return_on_equity": "16%"
                }},
                "historical_financial_analysis": {{
                "revenue": {{
                    "years": ["2019", "2020", "2021", "2022", "2023"],
                    "values": [5, 5.5, 6, 6.5, 7],
                    "unit": "Millions"
                }},
                "profit_margin": {{
                    "years": ["2019", "2020", "2021", "2022", "2023"],
                    "values": [20, 25, 22, 23, 24],
                    "unit": "Percentage"
                }}
                }},
                "bank_statement_analysis": "The bank statement analysis reveals consistent cash inflows and stable financial transactions, indicating a strong liquidity position.",
                "credit_score_analysis": "The credit score certificate confirms the company's strong creditworthiness, with a score of 750."
            }},
            "risk_analysis": {{
                "risk_level": "Medium",
                "risk_factors": [
                "Moderate risk due to market competition",
                "Stable revenue with increasing profitability"
                ],
                "external_risk_factors": {{
                "market_competition": {{
                    "level": "High",
                    "description": "Intense competition"
                }},
                "regulatory_changes": {{
                    "level": "Moderate",
                    "description": "New compliance laws"
                }},
                "economic_factors": {{
                    "level": "Low",
                    "description": "Stable economic conditions"
                }}
                }}
            }},
            "collateral_and_security_analysis": {{
                "collateral_value": "15,000,000",
                "adequacy": "Adequate"
            }},
            "sector_and_market_position_analysis": {{
                "market_share": "10%",
                "growth_rate": "5%",
                "competition_level": "High"
            }},
            "final_profile_score_calculation": {{
                "cumulative_profile_score": "8.5",
                "final_recommendation": "Approval",
                "recommendation_reason": "Strong financial performance, adequate collateral, and favorable market position."
            }},
            "executive_summary": {{
                "button_text": "Download",
                "url": "link_to_download"
            }}
            }}
            Return the output as a valid JSON object.
            """

        try:
            # Bank Statement Analysis for Business Loan
            if bank_statement_file:
                bank_statement_pdf = bank_statement_file.read()
                bank_statement_insights = analyze_transactions(extract_transactions_from_pdf(BytesIO(bank_statement_pdf)))

                # Add bank statement analysis to the credit memo prompt
                credit_memo_prompt += f"\n\nBank Statement Analysis:\n{json.dumps(bank_statement_insights, indent=4)}"

            credit_memo_response = get_gemini_text_response(credit_memo_prompt)
            save_json_to_azure(credit_memo_response, memo_id, "credit_memo.json")

            return jsonify({
                "status": "success",
                "message": "Credit Memo and files saved successfully in Azure Blob Storage.",
                "memo_id": memo_id
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"An error occurred while generating the credit memo: {e}"
            }), 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An error occurred while processing the business loan application: {e}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
