import os
import shutil
import zipfile
import subprocess

def main():
    base_dir = r"P:\antigravity-ide\scratch\ServeJoy"
    dist_dir = os.path.join(base_dir, "dist")
    extracted_dir = os.path.join(base_dir, "extracted")
    public_dir = os.path.join(extracted_dir, "assets", "public")
    unsigned_apk = os.path.join(base_dir, "ServeJoy-unsigned.apk")
    signer_jar = os.path.join(base_dir, "uber-apk-signer.jar")

    print("[1] Syncing dist/ into extracted/assets/public/...")
    # Clean old assets folder
    old_assets = os.path.join(public_dir, "assets")
    if os.path.exists(old_assets):
        shutil.rmtree(old_assets)

    # Copy all items from dist into public
    for item in os.listdir(dist_dir):
        s = os.path.join(dist_dir, item)
        d = os.path.join(public_dir, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)

    print("[2] Packaging extracted/ into ServeJoy-unsigned.apk...")
    if os.path.exists(unsigned_apk):
        os.remove(unsigned_apk)

    # Note: resources.arsc should be uncompressed (STORED) for Android compatibility
    with zipfile.ZipFile(unsigned_apk, 'w') as zf:
        for root, dirs, files in os.walk(extracted_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, extracted_dir).replace('\\', '/')
                # resources.arsc must be stored uncompressed
                if rel_path == 'resources.arsc':
                    zf.write(abs_path, rel_path, compress_type=zipfile.ZIP_STORED)
                else:
                    zf.write(abs_path, rel_path, compress_type=zipfile.ZIP_DEFLATED)

    print(f"Unsigned APK created: {os.path.getsize(unsigned_apk)} bytes")

    print("[3] Signing and zipaligning with uber-apk-signer...")
    res = subprocess.run([
        "java", "-jar", signer_jar,
        "-a", unsigned_apk,
        "--allowResign",
        "--overwrite"
    ], capture_output=True, text=True)

    print("uber-apk-signer output:")
    print(res.stdout)
    if res.stderr:
        print("uber-apk-signer error:", res.stderr)

    # Replace ServeJoy.apk with the newly signed APK
    signed_apk = os.path.join(base_dir, "ServeJoy-unsigned-aligned-debugSigned.apk")
    final_apk = os.path.join(base_dir, "ServeJoy.apk")

    if os.path.exists(signed_apk):
        if os.path.exists(final_apk):
            os.remove(final_apk)
        os.rename(signed_apk, final_apk)
        print(f"SUCCESS! New ServeJoy.apk generated: {os.path.getsize(final_apk)} bytes")
    elif os.path.exists(unsigned_apk):
        print("Checking if direct overwrite happened...")
        if os.path.exists(final_apk):
            os.remove(final_apk)
        shutil.copy2(unsigned_apk, final_apk)
        print(f"Updated ServeJoy.apk: {os.path.getsize(final_apk)} bytes")

    if os.path.exists(unsigned_apk):
        os.remove(unsigned_apk)

if __name__ == '__main__':
    main()
