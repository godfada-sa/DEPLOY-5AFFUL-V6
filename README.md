<div align="center">

<img src="https://raw.githubusercontent.com/godfada-sa/5AFFUL-BOT-V6/main/assets/safful-repo.jpg" alt="SAFFUL // </vibe coder>" width="370" />

# `> SAFFUL_V6_`

### `</ v i b e   c o d e r >`

![STATUS](https://img.shields.io/badge/STATUS-ONLINE-00ff9c?style=for-the-badge&labelColor=0d1117)
![MODE](https://img.shields.io/badge/MODE-DEPLOY-6ee7ff?style=for-the-badge&labelColor=0d1117)
![ACCESS](https://img.shields.io/badge/ACCESS-OWNER__ONLY-ff4d6d?style=for-the-badge&labelColor=0d1117)

**`// one file. one command. one bot.`**

</div>

---

```console
safful@node:~$ ssh deploy@5afful
[  OK  ] handshake .............. accepted
[  OK  ] identity ............... safful
[  OK  ] payload ................ index.js
[  ..  ] scanning target ........ 5afful-v6
[ DONE ] access ................. GRANTED

safful@node:~$ cat /etc/motd
> this node deploys 5AFFUL V6.
> nothing else is stored here.
```

<div align="center">

## `[ 00 ]  //  G E T   T H E   F I L E`

</div>

**No folder inside a folder.** Use the release file, not the green *Code > Download ZIP* button.

| FILE | WHAT YOU GET |
|---|---|
| [`deploy-5afful-v6.zip`](https://github.com/godfada-sa/DEPLOY-5AFFUL-V6/releases/latest/download/deploy-5afful-v6.zip) | a flat zip: `index.js` + this README, **no nested folder** |
| [`index.js`](https://github.com/godfada-sa/DEPLOY-5AFFUL-V6/releases/latest/download/index.js) | the single file, straight to your downloads |

```console
# on the panel, in the main container:
wget https://github.com/godfada-sa/DEPLOY-5AFFUL-V6/releases/latest/download/index.js
# or
curl -O https://github.com/godfada-sa/DEPLOY-5AFFUL-V6/releases/latest/download/index.js
```

Unzip the release file **in the main container** — the files land right there. Nothing to move.

> The GitHub *Code > Download ZIP* always puts everything in `DEPLOY-5AFFUL-V6-main/`.
> That is why this repo ships a flat release file: no extra folder, no moving.

<div align="center">

## `[ 01 ]  //  T H E   L I N K`

</div>

```bash
git clone https://github.com/godfada-sa/DEPLOY-5AFFUL-V6.git
cd DEPLOY-5AFFUL-V6
node index.js
```

**Target:** `https://github.com/godfada-sa/DEPLOY-5AFFUL-V6.git`

| NODE | ADDRESS | STATE |
|---|---|---|
| `DEPLOY` | `github.com/godfada-sa/DEPLOY-5AFFUL-V6` | 🟢 LIVE |
| `PAIR` | `fiveafful-pair.onrender.com` | 🟢 LIVE |
| `RELAY` | `t.me/saf_ful` | 🟢 LIVE |

<div align="center">

## `[ 02 ]  //  P A I R`

</div>

> [!IMPORTANT]
> **Pairing site:** [**https://fiveafful-pair.onrender.com**](https://fiveafful-pair.onrender.com)

```console
root@safful:~$ open https://fiveafful-pair.onrender.com
[  ..  ] waiting for the site to wake up ... (free host, up to 1 minute)
[  ..  ] request link code
[  OK  ] open WhatsApp -> Linked devices -> Link a device
[  OK  ] enter the code (or scan the QR)
[ DONE ] session ID received:  TFX-XXXX-XXXX-XXXX
```

1. Open **https://fiveafful-pair.onrender.com**.
2. In WhatsApp on the bot phone: **Linked devices → Link a device**.
3. If the pairing code is not accepted, use the **QR code** option.
4. The site gives you a session ID like `TFX-K7M2-9QXA-4BNP`.

> [!WARNING]
> The session ID burns **once** and dies in **5 minutes**. Paste it and boot within that window. If it expired, pair again and use the new ID.

<div align="center">

## `[ 03 ]  //  E X E C U T E`

</div>

```console
STEP 01  ->  drop index.js in the main container
STEP 02  ->  paste the session ID in SESSION_IDS
STEP 03  ->  node index.js
STEP 04  ->  bot online
```

```js
const SESSION_IDS = `
TFX-XXXX-XXXX-XXXX
`;
```

A second number goes on a new line with a name:

```js
const SESSION_IDS = `
TFX-XXXX-XXXX-XXXX
shop=TFX-YYYY-YYYY-YYYY
`;
```

| COMMAND | EFFECT |
|---|---|
| `node index.js` | install on first run, then boot |
| `node index.js --update` | re-download, keep `session/`, `data/`, `accounts/`, `session_id.txt` |
| `BOT_NO_START=1 node index.js` | install only, do not boot |

> [!CAUTION]
> WhatsApp does not officially allow bots. Use a **spare number**, never your main one. Never share your session ID or pairing code.

<div align="center">

## `[ 04 ]  //  S Y S T E M   S P E C S`

</div>

```console
root@safful:~$ ./5afful --info
name ............ 5AFFUL V6
runtime ......... Node.js 20+
commands ........ 347 / 15 categories
defense ......... antilink :: antispam :: antiraid :: antibot
payload ......... stickers :: downloads :: games :: tools
login ........... fiveafful-pair.onrender.com
```

<div align="center">

```console
[ connection closed ]
> no logs kept. no keys leaked. no trace left.
> logout
```

**[`git clone https://github.com/godfada-sa/DEPLOY-5AFFUL-V6.git`](https://github.com/godfada-sa/DEPLOY-5AFFUL-V6.git)**

`SAFFUL V6 // MIT // made by Safful`

</div>
