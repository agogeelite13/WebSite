
import subprocess
import os

def fix_css():
    target_commit = "16584b4"
    file_path = "styles.css"
    
    try:
        # Get content from git
        print(f"Extracting {file_path} from commit {target_commit}...")
        result = subprocess.run(["git", "show", f"{target_commit}:{file_path}"], capture_output=True, check=True)
        content = result.stdout.decode('utf-8', errors='ignore')
        
        # Identify the end of the file (before existing corruption)
        # Assuming the file was stable at Phase 44
        
        # Write clean version
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        print("Restored stable version of styles.css")
        
    except Exception as e:
        print(f"Error during restoration: {e}")

if __name__ == "__main__":
    fix_css()
