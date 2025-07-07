import { useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, Upload, FileText, Code } from 'lucide-react';
import { toast } from 'sonner';
import { uploadLawDocument } from '../services/uploadService.js'; 

// Schema para um único artigo dentro da lei
const ArtigoSchema = z.object({
  numero: z.string().min(1, "O campo 'numero' do artigo é obrigatório."),
  texto: z.string().min(1, "O campo 'texto' do artigo é obrigatório."),
});

// Schema para o documento da Lei completa
const LawSchema = z.object({
  titulo: z.string().min(1, "O campo 'titulo' é obrigatório."),
  tipo: z.string().min(1, "O campo 'tipo' é obrigatório."),
  referencia: z.string().optional(),
  palavrasChave: z.array(z.string()).optional(),
  artigos: z.array(ArtigoSchema).min(1, "A lei deve ter pelo menos um artigo."),
});

// O JSON que esperamos é um ÚNICO objeto, não mais um array.
const jsonExample = `{
  "titulo": "CLT - Artigos Iniciais",
  "tipo": "lei",
  "referencia": "Decreto-Lei nº 5.452/43",
  "palavrasChave": ["clt", "trabalho", "empregador", "empregado"],
  "artigos": [
    {
      "numero": "1",
      "texto": "Esta Consolidação estatui as normas que regulam as relações individuais e coletivas de trabalho, nela previstas."
    },
    {
      "numero": "2",
      "texto": "Considera-se empregador a empresa, individual ou coletiva, que, assumindo os riscos da atividade econômica, admite, assalaria e dirige a prestação pessoal de serviço."
    }
  ]
}`;

export function VadeUploadPage() {
  const [documentId, setDocumentId] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [validatedData, setValidatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidate = () => {
    setValidationResult(null);
    setValidatedData(null);

    if (!documentId.trim()) {
      setValidationResult({ success: false, message: "O 'ID do Documento' é obrigatório." });
      return;
    }
    if (!jsonText.trim()) {
      setValidationResult({ success: false, message: "A área de texto do JSON está vazia." });
      return;
    }

    try {
      const parsedData = JSON.parse(jsonText);
      LawSchema.parse(parsedData); 
      setValidationResult({ success: true, message: `JSON válido! Lei '${parsedData.titulo}' com ${parsedData.artigos.length} artigo(s) pronta para envio.` });
      setValidatedData(parsedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        setValidationResult({ success: false, message: `Erro de validação no campo '${firstError.path.join('.')}': ${firstError.message}` });
      } else {
        setValidationResult({ success: false, message: "O texto não é um JSON válido. Verifique a sintaxe." });
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!validatedData || !documentId) {
      toast.error("Você precisa preencher o ID e validar o JSON antes de enviar.");
      return;
    }

    setIsLoading(true);
    toast.loading(`Enviando documento '${documentId}'...`);

    const result = await uploadLawDocument(documentId.trim(), validatedData);

    toast.dismiss();
    if (result.success) {
      toast.success(`Documento '${result.id}' salvo com sucesso!`);
      setJsonText('');
      setValidationResult(null);
      setValidatedData(null);
      setDocumentId('');
    } else {
      toast.error("Ocorreu um erro no envio.", { description: result.error });
    }
    setIsLoading(false);
  };
    
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-green-600/20 rounded-lg">
          <FileText className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Upload Vade Mecum</h1>
          <p className="text-gray-400">Envio de documentos legais completos</p>
        </div>
      </div>

      <div className="max-w-6xl space-y-6">
        {/* Card de Instruções */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <Code className="h-5 w-5 text-blue-400" />
              Instruções de Uso
            </CardTitle>
            <CardDescription className="text-gray-400">
              Use esta ferramenta para fazer o upload de uma lei inteira como um único documento com um ID personalizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-3 text-gray-300">Estrutura do objeto JSON:</p>
              <pre className="text-xs bg-gray-950 text-gray-200 p-4 rounded-lg overflow-x-auto border border-gray-700">
                {`{
  "titulo": "string",
  "tipo": "string", 
  "referencia": "string (opcional)",
  "palavrasChave": ["array", "de", "strings", "opcional"],
  "artigos": [
    { "numero": "string", "texto": "string" },
    { "numero": "string", "texto": "string" }
  ]
}`}
              </pre>
            </div>
            
            <div>
              <p className="text-sm font-semibold mt-6 mb-3 text-gray-300">Exemplo de um JSON válido:</p>
              <pre className="text-xs bg-gray-950 text-gray-200 p-4 rounded-lg overflow-x-auto border border-gray-700">
                {jsonExample}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Card do Formulário */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <Upload className="h-5 w-5 text-green-400" />
              Formulário de Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="documentId" className="text-gray-300 font-medium">
                  ID do Documento
                </Label>
                <Input
                  id="documentId"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="Ex: clt, codigo-civil, constituicao"
                  className="bg-gray-700 border-gray-600 text-gray-50 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400">Use apenas letras minúsculas e hífens</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="json-content" className="text-gray-300 font-medium">
                  JSON da Lei Completa
                </Label>
                <Textarea
                  id="json-content"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Cole aqui o JSON da lei completa..."
                  rows={16}
                  className="font-mono text-sm bg-gray-700 border-gray-600 text-gray-50 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Resultado da Validação */}
            {validationResult && (
              <Alert 
                variant={validationResult.success ? 'default' : 'destructive'} 
                className={`mt-6 ${validationResult.success 
                  ? 'bg-green-900/50 border-green-700 text-green-100' 
                  : 'bg-red-900/50 border-red-700 text-red-100'
                }`}
              >
                {validationResult.success ? 
                  <CheckCircle className="h-4 w-4" /> : 
                  <AlertTriangle className="h-4 w-4" />
                }
                <AlertTitle>
                  {validationResult.success ? 'Validação Bem-sucedida!' : 'Erro de Validação'}
                </AlertTitle>
                <AlertDescription>{validationResult.message}</AlertDescription>
              </Alert>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={handleValidate} 
                disabled={isLoading}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-gray-50 hover:bg-gray-600 hover:text-white"
              >
                <Code className="mr-2 h-4 w-4" />
                Validar JSON
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!validationResult?.success || isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar para o Firebase
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

