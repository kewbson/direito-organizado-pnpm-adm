import { useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, Upload } from 'lucide-react';
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
  const [documentId, setDocumentId] = useState(''); // Estado para o ID personalizado
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
      // Valida o objeto contra o novo schema
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

    // Chamada real para a nossa nova função de serviço
    const result = await uploadLawDocument(documentId.trim(), validatedData);

    toast.dismiss(); // Remove a notificação de "carregando"
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
    <div className="space-y-6 w-200 items-center justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold">Upload de Lei Completa - Vade Mecum</h1>
        
        <Card className="bg-gray-900 text-gray-100 border border-gray-800">
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
            <CardDescription>
              Use esta ferramenta para fazer o upload de uma lei inteira como um único documento com um ID personalizado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold mb-2">Estrutura do objeto JSON:</p>
            <pre className="text-xs bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
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
            <p className="text-sm font-semibold mt-4 mb-2">Exemplo de um JSON válido:</p>
            <pre className="text-xs bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              {jsonExample}
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-gray-100 border border-gray-800">
          <CardHeader>
            <CardTitle>Formulário de Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentId">ID do Documento (ex: clt, codigo-civil)</Label>
                  <Input
                    id="documentId"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Use apenas letras minúsculas e hífens"
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="json-content">Cole o JSON da Lei Completa aqui</Label>
                  <Textarea
                    id="json-content"
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder="{ ... }"
                    rows={15}
                    className="font-mono text-sm mt-1"
                  />
                </div>
            </div>
            {validationResult && (
              <Alert variant={validationResult.success ? 'default' : 'destructive'} className="mt-4">
                {validationResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>{validationResult.success ? 'Sucesso!' : 'Erro de Validação'}</AlertTitle>
                <AlertDescription>{validationResult.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-4 mt-4">
              <Button onClick={handleValidate} disabled={isLoading}>Validar JSON</Button>
              <Button
                onClick={handleSubmit}
                disabled={!validationResult?.success || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Enviando...' : 'Enviar para o Firebase'}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}