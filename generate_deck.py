import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # Set standard 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Colors
    BG_DARK = RGBColor(15, 23, 42)       # Slate 900
    CARD_BG = RGBColor(30, 41, 59)       # Slate 800
    ACCENT_CYAN = RGBColor(56, 189, 248)  # Cyan 400
    ACCENT_EMERALD = RGBColor(52, 211, 153) # Emerald 400
    TEXT_LIGHT = RGBColor(248, 250, 252) # Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    WHITE = RGBColor(255, 255, 255)

    blank_layout = prs.slide_layouts[6]

    def set_bg(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_DARK

    def add_header(slide, title_text, category_text="RESILIPAY PITCH DECK"):
        # Category Tracker
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11), Inches(0.4))
        tf = txBox.text_frame
        p = tf.paragraphs[0]
        p.text = category_text.upper()
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_CYAN
        
        # Slide Title
        txBox2 = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.8))
        tf2 = txBox2.text_frame
        p2 = tf2.paragraphs[0]
        p2.text = title_text
        p2.font.size = Pt(28)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_LIGHT

    def add_footnote(slide, footnote_text):
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(6.8), Inches(11.7), Inches(0.4))
        tf = txBox.text_frame
        p = tf.paragraphs[0]
        p.text = "📌 SOURCE / CITATION: " + footnote_text
        p.font.size = Pt(10)
        p.font.italic = True
        p.font.color.rgb = ACCENT_CYAN

    # ==================== SLIDE 1: PROBLEM ====================
    slide1 = prs.slides.add_slide(blank_layout)
    set_bg(slide1)
    
    # Title & Subtitle
    tb = slide1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(1.5))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "RESILIPAY"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN
    
    p_sub = tf.add_paragraph()
    p_sub.text = "Slide 1: Problem — Network Downtime Cripples Digital Commerce"
    p_sub.font.size = Pt(24)
    p_sub.font.bold = True
    p_sub.font.color.rgb = TEXT_LIGHT
    
    # 3 Stat Cards
    cards_data = [
        ("₦100B+ Annual Loss", "Core banking downtimes & network congestion cause 10-15% peak transaction failures across Nigerian merchants."),
        ("Single Point of Failure", "Traditional payments demand 100% continuous uptime from telecom towers & central bank switches (NIBSS NIP)."),
        ("Merchant Frustration", "Cashless economy push leaves merchants helpless when cloud switches hang, turning away customers.")
    ]
    
    for i, (title, desc) in enumerate(cards_data):
        left = Inches(0.8 + i * 3.9)
        top = Inches(2.5)
        width = Inches(3.6)
        height = Inches(4.0)
        
        shape = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = ACCENT_CYAN
        
        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = ACCENT_EMERALD
        
        p2 = tf.add_paragraph()
        p2.text = "\n" + desc
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_MUTED

    add_footnote(slide1, "NIBSS NIP Annual Industry Reports & Central Bank of Nigeria (CBN) Financial Stability Report 2023.")

    # ==================== SLIDE 2: SOLUTION ====================
    slide2 = prs.slides.add_slide(blank_layout)
    set_bg(slide2)
    add_header(slide2, "Slide 2: Solution — Feasible, Actionable & Cryptographic")
    
    sol_cards = [
        ("Asymmetric ECDSA Cryptography", "Generates client-side P-256 digital signatures directly on the mobile device without requiring active internet connection."),
        ("Dual-Channel Transmission", "Vouchers can be scanned instantly via high-density QR codes or sent over basic GSM SMS networks."),
        ("Zero-Trust Auto-Reconciliation", "Transactions are cryptographically tamper-proof offline and automatically settle to the core ledger once online.")
    ]
    
    for i, (title, desc) in enumerate(sol_cards):
        left = Inches(0.8 + i * 3.9)
        top = Inches(2.0)
        width = Inches(3.6)
        height = Inches(4.5)
        
        shape = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = ACCENT_EMERALD
        
        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"0{i+1}. {title}"
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = ACCENT_CYAN
        
        p2 = tf.add_paragraph()
        p2.text = "\n" + desc
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_LIGHT

    add_footnote(slide2, "NIST FIPS 186-4 Elliptic Curve Digital Signature Standard (ECDSA P-256) & W3C Web Cryptography Standard.")

    # ==================== SLIDE 3: MARKET & COMPETITION ====================
    slide3 = prs.slides.add_slide(blank_layout)
    set_bg(slide3)
    add_header(slide3, "Slide 3: Market & Competitive Advantage")
    
    # Left Box: Market
    mkt_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.5))
    mkt_box.fill.solid()
    mkt_box.fill.fore_color.rgb = CARD_BG
    mkt_box.line.color.rgb = ACCENT_CYAN
    tf = mkt_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Target Market ($600T+ NIBSS Volume)"
    p.font.size = Pt(19)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN
    
    mkt_points = [
        "\n• Commercial Banks & Top Fintechs (Moniepoint, OPay, Palmpay).",
        "• 1.5M+ Registered Agency Banking Agents across Nigeria.",
        "• $100B+ Annual instant electronic transaction processing volume needing 99.99% uptime resilience."
    ]
    for pt in mkt_points:
        p = tf.add_paragraph()
        p.text = pt
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_LIGHT

    # Right Box: Competition
    comp_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.5))
    comp_box.fill.solid()
    comp_box.fill.fore_color.rgb = CARD_BG
    comp_box.line.color.rgb = ACCENT_EMERALD
    tf2 = comp_box.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Competitive Advantage"
    p.font.size = Pt(19)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    
    comp_points = [
        "\n• Legacy USSD / POS: Fails when cell towers or core switches drop.",
        "• Hardware NFC Cards: Expensive custom hardware & physical smartcard issuance.",
        "• ResiliPay Advantage: 100% Software B2B SDK, zero hardware cost, works on existing smartphones & basic SMS fallback."
    ]
    for pt in comp_points:
        p = tf2.add_paragraph()
        p.text = pt
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_LIGHT

    add_footnote(slide3, "EFInA Access to Financial Services Survey 2023 & GSMA State of the Industry Report on Mobile Money 2023.")

    # ==================== SLIDE 4: BUSINESS MODEL ====================
    slide4 = prs.slides.add_slide(blank_layout)
    set_bg(slide4)
    add_header(slide4, "Slide 4: Business Model — How We Generate Revenue")
    
    bm_items = [
        ("B2B SDK Licensing", "Annual recurring license fee for banks and fintech mobile application integration."),
        ("Micro-Transaction Routing Fee", "Flat 0.1% or ₦5 per offline-settled voucher processed through our gateway."),
        ("Enterprise SLA & Infrastructure", "Custom offline node deployment and premium support for high-volume POS agent networks.")
    ]
    
    for i, (title, desc) in enumerate(bm_items):
        left = Inches(0.8 + i * 3.9)
        top = Inches(2.0)
        width = Inches(3.6)
        height = Inches(4.5)
        
        shape = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = ACCENT_CYAN
        
        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = ACCENT_CYAN
        
        p2 = tf.add_paragraph()
        p2.text = "\n" + desc
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_MUTED

    add_footnote(slide4, "Benchmark Financial SaaS Pricing Models (Stripe, Interswitch B2B Gateway Tier Structure).")

    # ==================== SLIDE 5: TRACTION & VALIDATION ====================
    slide5 = prs.slides.add_slide(blank_layout)
    set_bg(slide5)
    add_header(slide5, "Slide 5: Traction & Validation — Proof of Concept")
    
    trac_box = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(11.7), Inches(4.5))
    trac_box.fill.solid()
    trac_box.fill.fore_color.rgb = CARD_BG
    trac_box.line.color.rgb = ACCENT_EMERALD
    tf = trac_box.text_frame
    tf.word_wrap = True
    
    t_items = [
        ("Functional Protocol & SDK", "Built and deployed a zero-dependency cryptographic PWA & SDK supporting offline ECDSA key generation, QR payload creation, and automated reconciliation."),
        ("Performance Benchmark", "Verified sub-50ms cryptographic signing & verification latency on standard mobile hardware with zero internet connectivity."),
        ("Cryptographic Tamper Protection", "Proven tamper detection that instantly blocks modified amounts or replayed transaction nonces."),
        ("Industry Validation", "Positive feedback from merchant operators and agent banking partners prioritizing uptime resilience.")
    ]
    
    for i, (head, body) in enumerate(t_items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {head}: {body}\n"
        p.font.size = Pt(15)
        p.font.color.rgb = TEXT_LIGHT

    add_footnote(slide5, "Live Prototype Benchmarks (Chrome DevTools WebCrypto Performance Profiler & Vercel Production Build).")

    # ==================== SLIDE 6: ASK ====================
    slide6 = prs.slides.add_slide(blank_layout)
    set_bg(slide6)
    add_header(slide6, "Slide 6: Ask — Next Steps & Pilot Execution")
    
    ask_items = [
        ("Bank Sandbox Integration", "Access to bank & fintech API sandboxes (e.g. NIBSS, Interswitch, partner banks) for core ledger hook integration."),
        ("Pilot Deployment", "Conduct a 30-day live pilot trial with selected POS agent banking networks in high-downtime regions."),
        ("Regulatory Guidance", "Mentorship on CBN Sandbox compliance for offline financial token & cryptographic settlement standards.")
    ]
    
    for i, (title, desc) in enumerate(ask_items):
        left = Inches(0.8 + i * 3.9)
        top = Inches(2.0)
        width = Inches(3.6)
        height = Inches(4.5)
        
        shape = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = ACCENT_CYAN
        
        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = ACCENT_CYAN
        
        p2 = tf.add_paragraph()
        p2.text = "\n" + desc
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_LIGHT

    add_footnote(slide6, "Central Bank of Nigeria (CBN) Regulatory Framework for Sandbox Operations.")

    # ==================== SLIDE 7: TEAM ====================
    slide7 = prs.slides.add_slide(blank_layout)
    set_bg(slide7)
    add_header(slide7, "Slide 7: Team — The Minds Behind ResiliPay")
    
    team_box = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(11.7), Inches(4.5))
    team_box.fill.solid()
    team_box.fill.fore_color.rgb = CARD_BG
    team_box.line.color.rgb = ACCENT_EMERALD
    tf = team_box.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = "Brayan — Lead Full-Stack & Cryptographic Engineer"
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    
    details = [
        "\n• Responsible for Protocol Architecture, Web Crypto API Integration, ResiliPay SDK Development, and System Design.",
        "• Passionate about building resilient, fault-tolerant financial infrastructure for emerging markets.",
        "\n\n👉 NEXT UP: LIVE PRODUCT DEMONSTRATION"
    ]
    for d in details:
        p2 = tf.add_paragraph()
        p2.text = d
        p2.font.size = Pt(16)
        p2.font.color.rgb = TEXT_LIGHT

    add_footnote(slide7, "ResiliPay Architectural Blueprint & Software Development Kit (SDK v1.0).")

    try:
        prs.save("ResiliPay_7_Slide_Pitch_Deck.pptx")
    except Exception as e:
        print("Could not overwrite open file, saving as Cited variant:", e)
    prs.save("ResiliPay_7_Slide_Pitch_Deck_Cited.pptx")
    print("Successfully generated ResiliPay_7_Slide_Pitch_Deck_Cited.pptx with sources & citations!")

if __name__ == "__main__":
    create_deck()
