commit 1500ada0086b5e049f3e719245e05fffbf3704ba
Author: ilhan orhan <ilhan.orhan007@gmail.com>
Date:   Sat Mar 7 08:39:29 2026 +0200

    fix(release): correct changelog extraction regex (#13214)
    
    fix(release): correct changelog extraction regex in extractChangelog.mjs
    
    The multiline flag causes $ to match end of every line, making
    the lazy capture group always return empty. This resulted in all
    2.20.x GitHub releases having empty release notes.
    
    Change the lookahead from (?=^# \[|$) to (?=\n# \[|$(?!\n)) so
    $ only matches the true end of string, not end of each line.
