import uuid
import base64
import os

# Configuration
APP_NAME = "VibraX"
APP_URL = "https://vibraxmusic.vercel.app/app"
ICON_PATH = "public/icon-512.png"
ORGANIZATION = "VibraX Music"

def generate_uuid():
    return str(uuid.uuid4()).upper()

def get_base64_icon(path):
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def create_mobileconfig():
    icon_b64 = get_base64_icon(ICON_PATH)
    profile_uuid = generate_uuid()
    payload_uuid = generate_uuid()

    template = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
            {icon_b64}
            </data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>{APP_NAME}</string>
            <key>PayloadDescription</key>
            <string>Configures settings for VibraX Web Clip</string>
            <key>PayloadDisplayName</key>
            <string>Web Clip ({APP_NAME})</string>
            <key>PayloadIdentifier</key>
            <string>com.apple.webClip.managed.{payload_uuid}</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>{payload_uuid}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>{APP_URL}</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>{APP_NAME} Installation Profile</string>
    <key>PayloadIdentifier</key>
    <string>com.vibrax.install.{profile_uuid}</string>
    <key>PayloadOrganization</key>
    <string>{ORGANIZATION}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>{profile_uuid}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
"""
    
    output_file = "vibrax.mobileconfig"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(template)
    
    print(f"Successfully generated {output_file}")
    print(f"Make sure to update the APP_URL in the script if your site is different.")

if __name__ == "__main__":
    create_mobileconfig()
