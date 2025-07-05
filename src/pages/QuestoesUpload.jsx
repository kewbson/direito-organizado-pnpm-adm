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
import { batchUploadQuestoes } from '../services/uploadService';

// Schema de validação para cada objeto de questão
const QuestaoSchema = z.object({
  q: z.string().min(1, "O campo 'q' (pergunta) é obrigatório."),
  opts: z.array(z.string()).length(4, "O campo 'opts' deve ser um array com exatamente 4 opções."),
  a: z.number().min(0).max(3, "O campo 'a' (resposta) deve ser um número entre 0 e 3."),
  expl: z.string().optional(),
  periodo: z.number().optional(),
});

const QuestoesArraySchema = z.array(QuestaoSchema);

const jsonExample = `[
  {
    "q": "Qual o prazo para o Presidente da República sancionar um projeto de lei?",
    "opts": ["10 dias úteis", "15 dias corridos", "15 dias úteis", "30 dias"],
    "a": 2,
    "expl": "Conforme o Art. 66, § 1º da CF, o prazo é de 15 dias úteis para sanção ou veto.",
    "periodo": 1
  }
]`;

export function QuestoesUploadPage() {
  const [jsonText, setJsonText] = useState('');
  const [subjectId, setSubjectId] = useState(''); // Estado para o ID da matéria
  const [validationResult, setValidationResult] = useState(null);
  const [validatedData, setValidatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidate = () => {
    setValidationResult(null);
    setValidatedData(null);

    if (!subjectId.trim()) {
        setValidationResult({ success: false, message: "O ID da Matéria é obrigatório." });
        return;
    }
    if (!jsonText.trim()) {
      setValidationResult({ success: false, message: "A área de texto do JSON está vazia." });
      return;
    }

    try {
      const parsedData = JSON.parse(jsonText);
      QuestoesArraySchema.parse(parsedData);
      setValidationResult({ success: true, message: `JSON válido! ${parsedData.length} questão(ões) prontas para envio.` });
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
    if (!validatedData || !subjectId) {
      toast.error("Você precisa preencher o ID da matéria e validar o JSON antes de enviar.");
      return;
    }
    
    setIsLoading(true);
    toast.loading(`Enviando questões para a matéria '${subjectId}'...`);

    const result = await batchUploadQuestoes(subjectId, validatedData);

    toast.dismiss();
    if (result.success) {
      toast.success(`${result.count} questão(ões) enviada(s) com sucesso!`);
      setJsonText('');
      setValidationResult(null);
      setValidatedData(null);
    } else {
      toast.error("Ocorreu um erro no envio.", { description: result.error });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-1xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Upload em Massa - Questões</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Primeiro, digite o ID do documento da matéria (ex: `direito-constitucional`) que receberá estas questões. Depois, cole o array de objetos JSON.
            </p>
            <p className="text-sm font-semibold mb-2">Estrutura de cada objeto de questão:</p>
            <pre className="text-xs bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              {`{
  "q": "string (pergunta)",
  "opts": ["string", "string", "string", "string"],
  "a": "number (0 a 3, índice da resposta correta)",
  "expl": "string (explicação, opcional)",
  "periodo": "number (período/nível, opcional)"
}`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enviar Novas Questões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subjectId">ID da Matéria (do Firebase)</Label>
              <Input
                id="subjectId"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                placeholder="Ex: direito-constitucional"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="json-content">Cole seu JSON de questões aqui</Label>
              <Textarea
                id="json-content"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="[ { ... }, { ... } ]"
                rows={15}
                className="font-mono text-sm mt-1"
              />
            </div>
            {validationResult && (
              <Alert variant={validationResult.success ? 'default' : 'destructive'}>
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