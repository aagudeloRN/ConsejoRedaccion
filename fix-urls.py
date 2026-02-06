#!/usr/bin/env python3
"""
Script CORREGIDO para reemplazar URLs hardcodeadas
"""

import os
import re
from pathlib import Path

FRONTEND_SRC = Path("./frontend/src")

# Mapeo de archivos y sus URLs específicas
URL_MAPPINGS = {
    "app/council/page.tsx": [
        (r"fetch\('http://localhost:8001/news/'\)", "fetch(`${API_BASE_URL}/news/`)"),
        (r"fetch\(`http://localhost:8001/votes/council/\${newsId}\?in_council=\$\{!currentStatus\}`, \{", 
         "fetch(`${API_BASE_URL}/votes/council/${newsId}?in_council=${!currentStatus}`, {"),
        (r"fetch\('http://localhost:8001/votes/council/close', \{", 
         "fetch(`${API_BASE_URL}/votes/council/close`, {"),
    ],
    "app/council/matrix/page.tsx": [
        (r"fetch\('http://localhost:8001/users/'\)", "fetch(`${API_BASE_URL}/users/`)"),
        (r"fetch\('http://localhost:8001/news/'\)", "fetch(`${API_BASE_URL}/news/`)"),
        (r"fetch\(`http://localhost:8001/votes/news/\$\{n\.id\}`\)", 
         "fetch(`${API_BASE_URL}/votes/news/${n.id}`)"),
        (r"fetch\(`http://localhost:8001/news/\$\{selectedNews\.id\}`, \{", 
         "fetch(`${API_BASE_URL}/news/${selectedNews.id}`, {"),
    ],
    "app/news/[id]/page.tsx": [
        (r"fetch\(`http://localhost:8001/news/\$\{id\}`\)", 
         "fetch(`${API_BASE_URL}/news/${id}`)"),
        (r"fetch\(`http://localhost:8001/news/\$\{news\.id\}`, \{", 
         "fetch(`${API_BASE_URL}/news/${news.id}`, {"),
    ],
    "app/news/create/page.tsx": [
        (r'fetch\("http://localhost:8001/news/analyze", \{', 
         'fetch(`${API_BASE_URL}/news/analyze`, {'),
        (r'fetch\("http://localhost:8001/news/", \{', 
         'fetch(`${API_BASE_URL}/news/`, {'),
    ],
    "app/news/archive/page.tsx": [
        (r"fetch\('http://localhost:8001/news/\?include_archived=true'\)", 
         "fetch(`${API_BASE_URL}/news/?include_archived=true`)"),
        (r"fetch\(`http://localhost:8001/news/\$\{id\}/reactivate`, \{", 
         "fetch(`${API_BASE_URL}/news/${id}/reactivate`, {"),
    ],
    "app/stats/page.tsx": [
        (r"fetch\('http://localhost:8001/analytics/users'\)", 
         "fetch(`${API_BASE_URL}/analytics/users`)"),
    ],
    "app/users/manage/page.tsx": [
        (r"fetch\('http://localhost:8001/users/'\)", "fetch(`${API_BASE_URL}/users/`)"),
        (r"fetch\(`http://localhost:8001/users/\$\{editingUser\.id\}`, \{", 
         "fetch(`${API_BASE_URL}/users/${editingUser.id}`, {"),
        (r"fetch\(`http://localhost:8001/users/\$\{user\.id\}`, \{", 
         "fetch(`${API_BASE_URL}/users/${user.id}`, {"),
    ],
    "components/VoteCard.tsx": [
        (r"fetch\('http://localhost:8001/votes/', \{", 
         "fetch(`${API_BASE_URL}/votes/`, {"),
    ],
}

def add_import_if_missing(content):
    """Añade el import si no existe"""
    if "import API_BASE_URL from '@/config/api'" in content:
        return content
    
    lines = content.split('\n')
    last_import_idx = -1
    
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last_import_idx = i
    
    if last_import_idx >= 0:
        lines.insert(last_import_idx + 1, "import API_BASE_URL from '@/config/api';")
        return '\n'.join(lines)
    
    return content

def process_file(rel_path, mappings):
    """Procesa un archivo con sus mapeos específicos"""
    full_path = FRONTEND_SRC / rel_path
    
    if not full_path.exists():
        print(f"⚠️  {rel_path} no encontrado")
        return False
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Agregar import
    content = add_import_if_missing(content)
    
    # Aplicar reemplazos específicos
    for pattern, replacement in mappings:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        # Escribir
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {rel_path}")
        return True
    else:
        print(f"⏭️  {rel_path} (sin cambios)")
        return False

def main():
    print("🔄 Reemplazando URLs con mapeos específicos...\n")
    
    changed = 0
    for file_path, mappings in URL_MAPPINGS.items():
        if process_file(file_path, mappings):
            changed += 1
    
    print(f"\n✅ {changed} archivos actualizados")

if __name__ == "__main__":
    main()
