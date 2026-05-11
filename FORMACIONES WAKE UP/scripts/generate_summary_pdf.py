import json
import sys
from fpdf import FPDF
import os

class SummaryPDF(FPDF):
    def __init__(self):
        super().__init__()
        # Load system font for Unicode support (Spanish accents, etc.)
        font_path = "C:/Windows/Fonts/arial.ttf"
        if os.path.exists(font_path):
            self.add_font("Arial", "", font_path)
            self.add_font("Arial", "B", "C:/Windows/Fonts/arialbd.ttf")
            self.add_font("Arial", "I", "C:/Windows/Fonts/ariali.ttf")
            self.font_name = "Arial"
        else:
            self.font_name = "helvetica" # Fallback

    def header(self):
        # 1. Company Logo (Top Right)
        logo_path = "logo-wakeup-square.png"
        if os.path.exists(logo_path):
            self.image(logo_path, x=175, y=8, w=22)
        
        # 2. Header Text (Centered)
        self.set_y(10)
        self.set_font(self.font_name, 'B', 15)
        self.set_text_color(20, 40, 100) # Deep Navy
        self.cell(0, 10, 'WAKE UP SERVICIOS - BIBLIOTECA DIGITAL', 0, 1, 'C')
        
        self.set_font(self.font_name, 'I', 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, 'Resumen Ejecutivo de Alto Rendimiento para Líderes', 0, 1, 'C')
        
        # Horizontal line below header
        self.set_draw_color(20, 40, 100)
        self.set_line_width(0.5)
        self.line(10, 35, 200, 35)
        self.ln(20)

    def footer(self):
        # Set position at 2.5 cm from bottom
        self.set_y(-25)
        
        # 3. Dynamic Branding Logo (Bottom Right)
        if self.page_no() == 1:
            img_path = "Espartano.jpeg"
        else:
            img_path = "Foto Profesional 10.jpeg"
            
        if os.path.exists(img_path):
            # Place branding image at bottom right
            # Spartan and Photo are placed here
            self.image(img_path, x=178, y=268, w=18)
            
        self.set_font(self.font_name, 'I', 8)
        self.set_text_color(120, 120, 120)
        
        # Footer text (Legal)
        self.set_x(10)
        self.cell(0, 10, 'Resumen realizado por Aitor Dorronsoro. Todos los derechos reservados. Copyright © 2026 Wake Up Servicios.', 0, 0, 'L')
        
        # Page numbering (Centered)
        self.set_x(0)
        self.cell(0, 10, f'Página {self.page_no()} / {{nb}}', 0, 0, 'C')

    def add_section(self, title, content):
        self.set_font(self.font_name, 'B', 13)
        self.set_text_color(180, 40, 40) # Sophisticated Red for titles
        
        # Title with background tint
        self.set_fill_color(245, 245, 245)
        self.cell(0, 10, f"  {title.upper()}", 0, 1, 'L', fill=True)
        self.ln(4)
        
        self.set_font(self.font_name, '', 12.5) # Slightly larger font for extensiveness
        self.set_text_color(40, 40, 40)
        
        # Body text with generous leading (10.5 for extensiveness)
        self.multi_cell(0, 10.5, content, align='J', border=0)
        self.ln(10)

def create_pdf(book_data, output_path):
    pdf = SummaryPDF()
    pdf.alias_nb_pages()
    pdf.set_margins(15, 25, 15) # Optimized margins for 2-page feel
    pdf.add_page()
    
    # Book Title Banner
    pdf.set_fill_color(20, 40, 100) # Deep Navy background
    pdf.set_text_color(255, 255, 255) # White text
    pdf.set_font(pdf.font_name, 'B', 20)
    pdf.multi_cell(0, 18, book_data['title'].upper(), align='C', fill=True)
    pdf.ln(12)
    
    # Summary Content Sections
    pdf.add_section("1. Introducción y Tesis Central", book_data['intro'])
    pdf.add_section("2. Desglose Detallado por Capítulos", book_data['chapters'])
    
    # Check if we should force a page break or if it happened naturally
    # We want action plan and tips on page 2
    if pdf.get_y() < 180:
        pdf.ln(15) # Add some air
    
    pdf.add_section("3. Conclusiones y Filosofía de Éxito", book_data['conclusions'])
    
    # Highlight Box: Strategies for Wake Up
    pdf.ln(5)
    pdf.set_fill_color(254, 249, 195) # Soft yellow highlight
    pdf.set_draw_color(202, 138, 4) # Darker yellow border
    pdf.set_line_width(0.3)
    
    start_y = pdf.get_y()
    pdf.set_font(pdf.font_name, 'B', 14)
    pdf.set_text_color(180, 40, 40)
    pdf.cell(0, 12, "  ESTRATEGIA APLICADA: WAKE UP SERVICIOS", 0, 1, 'L', fill=True)
    pdf.ln(2)
    
    pdf.set_font(pdf.font_name, 'I', 12.5)
    pdf.set_text_color(0, 0, 0)
    pdf.multi_cell(0, 9, book_data['wake_up_advice'], align='J')
    
    end_y = pdf.get_y()
    pdf.rect(15, start_y, 180, end_y - start_y) # Box border
    pdf.ln(12)
    
    pdf.add_section("4. Plan de Acción Inmediato", book_data['action_plan'])
    pdf.add_section("5. KPIs y Métricas de Control", book_data['kpis'])
    
    # Final check for output directory
    dir_name = os.path.dirname(output_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    pdf.output(output_path)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_summary_pdf.py <json_path> <output_path>")
        sys.exit(1)
        
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    create_pdf(data, sys.argv[2])
