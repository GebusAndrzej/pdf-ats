# PDF Invisible Text Injector & ATS Checker (Web Edition)

Nowoczesna aplikacja internetowa (Single Page Application) działająca w **100% po stronie przeglądarki (Client-Side / Zero-Backend)**, służąca do niewidzialnego wstrzykiwania słów kluczowych do plików PDF (CV) oraz natychmiastowej weryfikacji tego, jak dokument jest interpretowany przez automatyczne systemy śledzenia aplikacji (**ATS**).

---

## Główne Funkcje

1. **100% Prywatności i Zgodność z RODO/GDPR**:
   - Wszystkie operacje (modyfikacja PDF, ekstrakcja tekstu, test pikselowy 150 DPI) odbywają się wyłącznie w pamięci przeglądarki użytkownika.
   - Żaden bajt pliku ani danych osobowych nie opuszcza urządzenia.

2. **Niewidzialność dla Oka Ludzkiego (3 Metody Ukrywania)**:
   - `render_mode_3` (domyślna, zalecana) – oficjalny standard PDF `3 Tr` (*neither fill nor stroke text*), stosowany przez silniki OCR do nakładania warstw tekstowych na skany. Zachowuje 100% integralności wizualnej (0 zmienionych pikseli).
   - `white` – biały kolor tekstu (`#FFFFFF`).
   - `underlay` – warstwa podkładowa pod grafiką dokumentu.

3. **100% Czytelności dla Parserów ATS**:
   - Systemy rekrutacyjne (Workday, Taleo, Greenhouse, eRecruiter itp.) oraz biblioteki tekstowe (`pdfjs`, `pdfminer`, `pypdf`, `pymupdf`) bez problemu odczytują wstrzyknięte słowa kluczowe.

4. **Pełna Obsługa Polskich Znaków UTF-8**:
   - Wbudowana zoptymalizowana czcionka Noto Sans zapewniająca bezbłędne kodowanie i zachowanie wszystkich polskich liter diakrytycznych: `ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ`.

5. **Interaktywna Weryfikacja**:
   - **Unified Diff**: Kolorowane linie dodane (zielone), usunięte (czerwone) i nagłówki.
   - **Wykrywanie Nowych Słów**: Zbiór nowo wprowadzonych unikalnych słów kluczowych jako tagi.
   - **Co Widzi ATS (Raw Text)**: Podgląd czystego strumienia znaków wyekstrahowanego przez silnik `pdf.js` z przyciskiem szybkiego kopiowania.
   - **Weryfikacja Pikselowa 150 DPI**: Porównanie bitmap oryginału i zmodyfikowanego PDF z możliwością podglądu mapy różnic pikselowych (`pixelmatch`).

6. **Edytor Słów Kluczowych**:
   - Wczytywanie z pliku `.txt` z automatycznym wykrywaniem kodowań (UTF-8, Windows-1250 / CP1250).
   - Narzędzie deduplikacji słów z zachowaniem kolejności.
   - Licznik słów i znaków na żywo.

---

## Uruchomienie Projektu

Wymagany Node.js 18+:

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Uruchomienie testów jednostkowych
npm test

# Zbudowanie wersji produkcyjnej
npm run build
```

---

## Architektura i Technologie

- **Framework**: React 18 + TypeScript + Vite
- **Style**: Tailwind CSS
- **Silnik Modyfikacji PDF**: `pdf-lib` + `@pdf-lib/fontkit`
- **Ekstrakcja ATS i Rendering**: `pdfjs-dist` (Mozilla PDF.js)
- **Weryfikacja Wizualna**: HTML5 Canvas + `pixelmatch`
- **Diff Tekstu**: `diff` (jsdiff)
- **Testy**: Vitest

---

## Licencja

Projekt udostępniany na liberalnej licencji **MIT** – pełna swoboda użycia darmowego i komercyjnego.
