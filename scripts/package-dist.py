#!/usr/bin/env python3
import os
import shutil
import zipfile

dist_dir = 'dist'
zip_name = 'dist.zip'
public_zip = os.path.join('public', 'dist.zip')

if not os.path.exists(dist_dir):
    print("Error: dist directory does not exist. Run vite build first.")
    exit(1)

# Clean any existing zip files inside dist first
for f in os.listdir(dist_dir):
    if f.endswith('.zip'):
        os.remove(os.path.join(dist_dir, f))

# Ensure .htaccess exists in dist
htaccess_src = os.path.join('public', '.htaccess')
htaccess_dest = os.path.join(dist_dir, '.htaccess')
if os.path.exists(htaccess_src) and not os.path.exists(htaccess_dest):
    shutil.copy(htaccess_src, htaccess_dest)

# Ensure unzip.php exists in dist
unzip_src = os.path.join('public', 'unzip.php')
unzip_dest = os.path.join(dist_dir, 'unzip.php')
if os.path.exists(unzip_src):
    shutil.copy(unzip_src, unzip_dest)

# Create zip file of dist directory contents (including index.html, .htaccess, unzip.php, assets)
with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file.endswith('.zip'):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, dist_dir)
            zipf.write(file_path, arcname)

size_kb = round(os.path.getsize(zip_name) / 1024, 1)
print(f"Successfully packaged {dist_dir} into {zip_name} ({size_kb} KB)")

# Clean any existing zip in dist again to guarantee 100% clean dist directory
for f in os.listdir(dist_dir):
    if f.endswith('.zip'):
        os.remove(os.path.join(dist_dir, f))

# Also copy to public directory for direct browser download
os.makedirs('public', exist_ok=True)
shutil.copy(zip_name, public_zip)

v11_zip = os.path.join('public', 'Sahtak-Dierhafer-v1.1.zip')
shutil.copy(zip_name, v11_zip)

v11_apk = os.path.join('public', 'Sahtak-Dierhafer-v1.1.apk')
shutil.copy(zip_name, v11_apk)

print(f"Copied {zip_name} to {public_zip}, {v11_zip}, and {v11_apk}")
