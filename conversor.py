from pypdf import PdfReader

def pdf_para_texto(caminho_pdf):
    # Carrega o arquivo PDF
    reader = PdfReader(caminho_pdf)
    texto_completo = ""
    
    # Percorre cada página do PDF e extrai o texto
    for pagina in reader.pages:
        texto = pagina.extract_text()
        if texto:
            texto_completo += texto + "\n"
            
    return texto_completo

# Insira aqui o caminho do seu arquivo PDF
caminho = "seu_arquivo.pdf"

# Executa a conversão
resultado = pdf_para_texto(caminho)

# Salva o texto extraído em um arquivo .txt
with open("resultado.txt", "w", encoding="utf-8") as f:
    f.write(resultado)

print("Conversão concluída! O texto foi salvo em 'resultado.txt'.")
