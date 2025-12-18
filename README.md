# x402 Payment Demo

Demo implementacji protokołu x402 - standardu płatności opartego na HTTP 402 "Payment Required". Aplikacja pokazuje jak zaimplementować paywall dla mediów (video/image) z płatnościami USDC na sieci Base.

## Architektura

```
src/
├── config/
│   └── x402-config.ts      # konfiguracja sieci, USDC, cen
├── hooks/
│   └── use-x402-payment.ts # logika połączenia z portfelem i płatności
├── components/
│   ├── video-player.tsx    # komponent video z paywallem
│   ├── image-viewer.tsx    # komponent image z paywallem
│   ├── payment-modal.tsx   # modal płatności (HTTP 402 response)
│   └── wallet-connect.tsx  # przycisk połączenia portfela
└── App.tsx                 # główny komponent, zarządzanie stanem
```

## Przepływ płatności

1. Użytkownik klika na zablokowane media
2. Aplikacja generuje x402 Payment Request (symulacja HTTP 402)
3. Modal pokazuje szczegóły płatności (kwota, odbiorca, sieć)
4. Użytkownik zatwierdza transakcję w portfelu
5. Aplikacja wysyła ERC-20 transfer USDC
6. Po potwierdzeniu - media się odblokowują

## Kluczowe elementy

### Połączenie z portfelem

Hook `use-x402-payment.ts` używa `window.ethereum` (standard EIP-1193) do komunikacji z portfelami jak MetaMask czy Coinbase Wallet. Obsługuje:
- żądanie dostępu do konta (`eth_requestAccounts`)
- przełączanie sieci (`wallet_switchEthereumChain`)
- dodawanie nowej sieci (`wallet_addEthereumChain`)
- wysyłanie transakcji (`eth_sendTransaction`)

### Transfer USDC

USDC to token ERC-20. Transfer wymaga wywołania funkcji `transfer(address,uint256)` na kontrakcie USDC. Funkcja `encodeTransferData` w hooku koduje to wywołanie:
- function selector: `0xa9059cbb`
- adres odbiorcy: 32 bajty
- kwota: 32 bajty (USDC ma 6 decimals)

### Persystencja sesji

Odblokowane treści są zapisywane w `sessionStorage` z kluczem powiązanym z adresem portfela. Każdy portfel ma osobną listę zakupów. Po odświeżeniu strony - zakupione treści pozostają odblokowane.

## Konfiguracja

Zmienne środowiskowe (plik `.env`):

```
VITE_RECIPIENT_ADDRESS=0x...  # adres odbiorcy płatności
VITE_USE_TESTNET=true         # true = Base Sepolia, false = Base Mainnet
VITE_PRICE_VIDEO=1000         # cena w USDC (6 decimals)
VITE_PRICE_IMAGE=1000
```

## Adresy kontraktów USDC

| Sieć | Adres |
|------|-------|
| Base Mainnet | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Base Sepolia | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

## Uruchomienie

```bash
cp .env.example .env
# edytuj .env - ustaw adres odbiorcy

npm install
npm run dev
```

## Testowanie

Do testów na Base Sepolia potrzebujesz:
- ETH na gas: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- USDC testowe: https://faucet.circle.com/

## Ograniczenia

To jest demo client-side. W produkcji:
- weryfikacja płatności powinna być po stronie serwera
- serwer powinien zwracać prawdziwy HTTP 402
- treści powinny być serwowane dopiero po weryfikacji transakcji on-chain

## Linki

- [x402 Whitepaper](https://www.x402.org/x402-whitepaper.pdf)
- [x402.org](https://www.x402.org/)
- [Base Network](https://base.org/)
- [EIP-1193 (Ethereum Provider)](https://eips.ethereum.org/EIPS/eip-1193)