import { useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, Upload, HelpCircle, Code } from 'lucide-react';
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
  const [subjectId, setSubjectId] = useState('');
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
      setSubjectId('');
    } else {
      toast.error("Ocorreu um erro no envio.", { description: result.error });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-600/20 rounded-lg">
          <HelpCircle className="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Upload de Questões</h1>
          <p className="text-gray-400">Envio em massa de questões para quiz</p>
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
              Primeiro, digite o ID do documento da matéria (ex: `direito-constitucional`) que receberá estas questões. Depois, cole o array de objetos JSON.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-3 text-gray-300">Estrutura de cada objeto de questão:</p>
              <pre className="text-xs bg-gray-950 text-gray-200 p-4 rounded-lg overflow-x-auto border border-gray-700">
                {`{
  "q": "string (pergunta)",
  "opts": ["string", "string", "string", "string"],
  "a": "number (0 a 3, índice da resposta correta)",
  "expl": "string (explicação, opcional)",
  "periodo": "number (período/nível, opcional)"
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
              <Upload className="h-5 w-5 text-purple-400" />
              Enviar Novas Questões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subjectId" className="text-gray-300 font-medium">
                ID da Matéria (Firebase)
              </Label>
              <Input
                id="subjectId"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                placeholder="Ex: direito-constitucional, direito-civil"
                className="bg-gray-700 border-gray-600 text-gray-50 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400">ID do documento da matéria no Firebase</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="json-content" className="text-gray-300 font-medium">
                JSON das Questões
              </Label>
              <Textarea
                id="json-content"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Cole aqui o array JSON com as questões..."
                rows={16}
                className="font-mono text-sm bg-gray-700 border-gray-600 text-gray-50 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
              />
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
                className="bg-purple-600 hover:bg-purple-700 text-white"
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

