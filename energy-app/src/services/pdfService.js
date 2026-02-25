import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (reportText, stats, chartContainerIds) => {
    try {
        // A4 size in mm: 210 x 297
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;

        // Helper to add a new page
        const addNewPage = () => {
            pdf.addPage();
            return margin; // Returns starting Y position for the new page
        };

        // --- PAGE 1: COVER ---
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        pdf.setTextColor(56, 189, 248); // sky-400
        pdf.setFontSize(28);
        pdf.setFont("helvetica", "bold");
        pdf.text("Informe de Autodiagnóstico", pageWidth / 2, pageHeight / 3, { align: "center" });

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.text("Energético ISO 50001", pageWidth / 2, (pageHeight / 3) + 12, { align: "center" });

        pdf.setFontSize(12);
        pdf.setTextColor(148, 163, 184); // slate-400
        const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
        pdf.text(`Fecha de generación: ${dateStr}`, pageWidth / 2, (pageHeight / 3) + 30, { align: "center" });

        // --- PAGE 2: EXECUTIVE SUMMARY & KPIs ---
        let currentY = addNewPage();
        pdf.setTextColor(30, 41, 59); // slate-800

        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("Resumen Ejecutivo (KPIs)", margin, currentY);
        currentY += 15;

        // KPI boxes simulation
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        const kpis = [
            `Consumo Total Estimado: ${Math.round(stats.totalConsumo / 1000).toLocaleString('es-CO')} kWh/mes`,
            `Costo Operativo Total: $${Math.round(stats.totalCosto).toLocaleString('es-CO')} COP/mes`,
            `Total de Equipos Activos: ${stats.equiposActivos} unidades`
        ];

        kpis.forEach(kpi => {
            pdf.rect(margin, currentY, pageWidth - (margin * 2), 10);
            pdf.text(kpi, margin + 5, currentY + 7);
            currentY += 15;
        });

        // --- PAGE 3+: CHARTS ---
        if (chartContainerIds && chartContainerIds.length > 0) {
            for (const id of chartContainerIds) {
                const element = document.getElementById(id);
                if (element) {
                    currentY = addNewPage();
                    pdf.setFontSize(18);
                    pdf.setFont("helvetica", "bold");

                    let title = "Visualización Analítica";
                    if (id.includes('sankey')) title = "Diagrama de Flujo Energético (Sankey)";
                    if (id.includes('bar')) title = "Consumo por Localización / Área";
                    if (id.includes('timeline')) title = "Evolución Histórica";

                    pdf.text(title, margin, currentY);
                    currentY += 10;

                    // Capture HTML as canvas
                    const canvas = await html2canvas(element, {
                        scale: 2, // higher resolution
                        backgroundColor: '#0f172a', // slate-900 to match theme
                        logging: false
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);

                    // Calculate dimensions to fit A4 width
                    const imgWidth = pageWidth - (margin * 2);
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    // If image is too tall for page, scale it down
                    let finalHeight = imgHeight;
                    let finalWidth = imgWidth;

                    if (currentY + finalHeight > pageHeight - margin) {
                        finalHeight = pageHeight - margin - currentY;
                        finalWidth = (canvas.width * finalHeight) / canvas.height;
                    }

                    // Center horizontally if scaled down by height
                    const xOffset = margin + ((imgWidth - finalWidth) / 2);

                    pdf.addImage(imgData, 'JPEG', xOffset, currentY, finalWidth, finalHeight);
                }
            }
        }

        // --- PAGE 4+: AI REPORT TEXT ---
        currentY = addNewPage();
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        pdf.text("Análisis Profesional Detallado", margin, currentY);
        currentY += 15;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        // Clean markdown loosely for PDF (remove ** and #)
        const cleanText = reportText
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold syntax
            .replace(/## (.*?)\n/g, '\n\n$1\n\n') // headers
            .replace(/### (.*?)\n/g, '\n$1\n') // headers
            .replace(/\* /g, '• '); // bullets

        const lines = pdf.splitTextToSize(cleanText, pageWidth - (margin * 2));

        for (let i = 0; i < lines.length; i++) {
            if (currentY > pageHeight - margin) {
                currentY = addNewPage();
            }
            pdf.text(lines[i], margin, currentY);
            currentY += 6; // line height
        }

        // --- SAVE ---
        const fileName = `Informe_ISO50001_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        return true;

    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
};
