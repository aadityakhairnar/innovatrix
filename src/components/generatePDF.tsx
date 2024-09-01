import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePDF = async (loanDecision: any) => {
  const doc = new jsPDF();

  // Optionally you can add title or meta information
  doc.text("Loan Decision Report", 10, 10);

  // Add each section of the loan decision data to the PDF
  doc.text(`Name: ${loanDecision.applicant_details.name}`, 10, 20);
  doc.text(`Age: ${loanDecision.applicant_details.age}`, 10, 30);
  doc.text(`Gender: ${loanDecision.applicant_details.gender}`, 10, 40);
  doc.text(`Occupation: ${loanDecision.applicant_details.occupation}`, 10, 50);
  doc.text(`Annual Income: ${loanDecision.applicant_details.annual_income}`, 10, 60);
  doc.text(`Employed At: ${loanDecision.applicant_details.company}`,10,60)
  doc.text(`Job Title: ${loanDecision.applicant_details.occupation}`,10,60)
  doc.text(`Employment Duration: ${loanDecision.applicant_details.employment_duration_years}`,10,60)
  doc.text(`Monthly Income: ${loanDecision.financial_analysis.monthly_income}`,10,60)
  doc.text(`Monthly EMI: ${loanDecision.financial_analysis.monthly_income}`,10,60)
  doc.text(`Monthly Expense: ${loanDecision.financial_analysis.monthly_income}`,10,60)
  doc.text(`Monthly Inco: ${loanDecision.financial_analysis.monthly_income}`,10,60)
  doc.text(`Monthly Income: ${loanDecision.financial_analysis.monthly_income}`,10,60)


  // You can render more complex layouts with html2canvas if necessary
  // const content = document.getElementById('content-id');
  // const canvas = await html2canvas(content!);
  // const imgData = canvas.toDataURL('image/png');
  // doc.addImage(imgData, 'PNG', 10, 10, 180, 160);

  // Save the PDF
  doc.save(`${loanDecision.applicant_details.name}_LoanDecision.pdf`);
};
