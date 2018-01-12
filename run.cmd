@ECHO off

IF NOT EXIST node_modules (
    ECHO 'Dependencies installing ...'
    npm install
    ECHO 'Dependencies installed'
)

IF NOT EXIST pw.log (
    CECHO /red "Save the password into the file "pw.log""
    PAUSE
    EXIT
)

IF NOT EXIST key (
    IF NOT EXIST key.log (
        CECHO /red "Save the key into the file "key.log" like:"
        CECHO /red
        CECHO /red "    {"
        CECHO /red "        "name":         "YOUR_NAME","
        CECHO /red "        "posting_key":  "YOUR_POSTING_KEY","
        CECHO /red "    }"
        CECHO /red
        PAUSE
        EXIT
    )
    node .\encrypt.js
)

node .\index.js
