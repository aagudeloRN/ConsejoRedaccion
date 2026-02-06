import requests
from pypdf import PdfReader
from io import BytesIO
import trafilatura
from bs4 import BeautifulSoup

def extract_from_url(url: str) -> str:
    """
    Extracts the main content from a URL using trafilatura (specialized for articles).
    Falls back to BeautifulSoup if trafilatura fails.
    """
    try:
        # Method 1: Use trafilatura (best for news articles)
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            # Extract main content, ignoring navigation, ads, scripts
            content = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                no_fallback=False,
                favor_recall=True  # Prefer getting more content
            )
            if content and len(content) > 100:
                return content[:20000]
        
        # Method 2: Fallback to requests + BeautifulSoup
        print(f"Trafilatura failed for {url}, trying BeautifulSoup...")
        response = requests.get(url, timeout=15, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        
        content_type = response.headers.get('Content-Type', '').lower()
        
        # Handle PDF URL
        if 'application/pdf' in content_type or url.endswith('.pdf'):
            return extract_from_pdf(response.content)
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Remove unwanted elements
        for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 
                         'iframe', 'noscript', 'form', 'button', 'input']):
            tag.decompose()
        
        # Try to find main content areas
        main_content = None
        for selector in ['article', 'main', '[role="main"]', '.post-content', 
                         '.entry-content', '.article-body', '.content']:
            main_content = soup.select_one(selector)
            if main_content:
                break
        
        if main_content:
            text = main_content.get_text(separator='\n', strip=True)
        else:
            # Fallback: get all paragraph text
            paragraphs = soup.find_all('p')
            text = '\n'.join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 50)
        
        if text and len(text) > 100:
            return text[:20000]
        
        return "No se pudo extraer contenido significativo de la URL."
        
    except Exception as e:
        error_msg = f"Error extracting URL: {str(e)}"
        print(error_msg)
        return error_msg

def extract_from_pdf(file_content: bytes) -> str:
    """
    Extracts text from a PDF file using pypdf.
    Returns a specific marker if no text is found (likely scanned).
    """
    try:
        reader = PdfReader(BytesIO(file_content))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        # Check for scanned PDF (little to no text extracted)
        if len(text.strip()) < 50:
             return "OCR_REQUIRED"
             
        return text
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"
