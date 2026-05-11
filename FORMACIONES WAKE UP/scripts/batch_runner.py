import json
import subprocess
import sys
import os

def run_batch(batch_json_path, category):
    with open(batch_json_path, 'r', encoding='utf-8') as f:
        books = json.load(f)
    
    for book in books:
        # Create a temporary JSON for each book in the batch
        temp_data_path = f"scripts/temp_book.json"
        with open(temp_data_path, 'w', encoding='utf-8') as tf:
            json.dump(book['data'], tf, indent=2, ensure_ascii=False)
        
        # Determine output directory: use book's own directory if specified, else use the default category arg
        target_category = book.get('directory', category)
        out_dir = f"libros/{target_category}"
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)
            
        out_path = f"libros/{target_category}/{book['filename']}"
        print(f"Generating {out_path}...")
        
        # Call generate_summary_pdf.py
        result = subprocess.run(['python', 'scripts/generate_summary_pdf.py', temp_data_path, out_path], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error generating {book['filename']}: {result.stderr}")
        else:
            print(f"Successfully generated {book['filename']}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python batch_runner.py <batch_json_path> <category>")
        sys.exit(1)
    run_batch(sys.argv[1], sys.argv[2])
