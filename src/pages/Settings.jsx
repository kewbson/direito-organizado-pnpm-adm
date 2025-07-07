import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, AlertTriangle, Upload, Download, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { addSampleDataToFirebase } from '../data/sampleVadeMecumData.js';
import { backupAllData, restoreAllData } from '../services/uploadService.js';

export function SettingsPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSeedData = async () => {
    const confirmation = window.confirm(
      "Você tem certeza? Isso adicionará documentos de exemplo à sua coleção 'vademecum' no Firebase. Esta ação não pode ser desfeita."
    );

    if (confirmation) {
      setIsSeeding(true);
      toast.loading("Populando o banco de dados...");

      const { addVadeMecumDocument } = await import('../services/vadeMecumService.js');
      const result = await addSampleDataToFirebase(addVadeMecumDocument);

      toast.dismiss();
      if (result.success) {
        toast.success(`${result.count} documentos de exemplo foram adicionados com sucesso!`);
      } else {
        toast.error("Ocorreu um erro ao popular o banco de dados.", {
          description: result.error,
        });
      }
      setIsSeeding(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    toast.loading("Gerando arquivo de backup...");

    const result = await backupAllData();
    toast.dismiss();

    if (result.success) {
      const jsonString = JSON.stringify(result.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-direito-organizado-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup baixado com sucesso!");
    } else {
      toast.error("Erro ao gerar backup.", { description: result.error });
    }
    setIsBackingUp(false);
  };

  const handleRestore = () => {
    const confirmation = window.confirm(
      "ATENÇÃO: A restauração irá SOBRESCREVER todos os dados existentes no Vade Mecum e nos Quizzes com os dados do arquivo de backup. Esta ação não pode ser desfeita. Deseja continuar?"
    );

    if (confirmation) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const backupData = JSON.parse(event.target.result);
              setIsRestoring(true);
              toast.loading("Restaurando dados a partir do backup...");
              const result = await restoreAllData(backupData);
              toast.dismiss();
              if (result.success) {
                toast.success("Restauração concluída! Recarregue o Dashboard para ver as mudanças.");
              } else {
                toast.error("Falha na restauração.", { description: result.error });
              }
              setIsRestoring(false);
            } catch (err) {
              toast.error("Arquivo inválido.", { description: "O arquivo selecionado não parece ser um JSON válido." });
            }
          };
          reader.readAsText(file);
        }
      };
      fileInput.click();
    }
  };
    
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-orange-600/20 rounded-lg">
          <Settings className="h-8 w-8 text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Configurações</h1>
          <p className="text-gray-400">Ferramentas de desenvolvedor e administração</p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Card de Backup e Restauração */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <Database className="h-5 w-5 text-blue-400" />
              Backup e Restauração
            </CardTitle>
            <CardDescription className="text-gray-400">
              Faça um backup completo ou restaure todos os dados do Vade Mecum e dos Quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-900/50 border-red-700 text-red-100">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção: Use com Cuidado</AlertTitle>
              <AlertDescription>
                A função de restauração é uma operação destrutiva e irá sobrescrever os dados atuais. Faça um backup antes de restaurar.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isBackingUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando Backup...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Fazer Backup Completo
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleRestore} 
                disabled={isRestoring}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-gray-50 hover:bg-gray-600 hover:text-white"
              >
                {isRestoring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
                    Restaurando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Restaurar de um Arquivo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Card de Popular Banco de Dados */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <Database className="h-5 w-5 text-green-400" />
              Popular Banco de Dados com Amostra
            </CardTitle>
            <CardDescription className="text-gray-400">
              Use esta ferramenta para adicionar um conjunto de dados de exemplo ao seu Vade Mecum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Isso irá ler o arquivo `sampleVadeMecumData.js` e adicionar cada um dos documentos à sua coleção `vademecum` no Firebase.
            </p>
            
            <Button 
              onClick={handleSeedData} 
              disabled={isSeeding}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSeeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Populando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Popular Vade Mecum
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

