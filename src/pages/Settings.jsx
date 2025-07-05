import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, AlertTriangle, Upload, Download } from 'lucide-react';
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

      // Nós precisamos importar a função 'addVadeMecumDocument' para o 'addSampleDataToFirebase' funcionar.
      // O ideal seria passar o serviço como dependência, mas para simplificar, vamos assumir que ele está disponível.
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
    <div className="max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Configurações de Desenvolvedor</h1>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
          <CardDescription>
            Faça um backup completo ou restaure todos os dados do Vade Mecum e dos Quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção: Use com Cuidado</AlertTitle>
            <AlertDescription>
              A função de restauração é uma operação destrutiva e irá sobrescrever os dados atuais. Faça um backup antes de restaurar.
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleBackup} disabled={isBackingUp}>
              <Download className="mr-2 h-4 w-4" />
              {isBackingUp ? 'Gerando Backup...' : 'Fazer Backup Completo'}
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              {isRestoring ? 'Restaurando...' : 'Restaurar de um Arquivo'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Popular Banco de Dados com Amostra</CardTitle>
          <CardDescription>
            Use esta ferramenta para adicionar um conjunto de dados de exemplo ao seu Vade Mecum.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Isso irá ler o arquivo `sampleVadeMecumData.js` e adicionar cada um dos documentos à sua coleção `vademecum` no Firebase.
          </p>
          <Button onClick={handleSeedData} disabled={isSeeding}>
            <Database className="mr-2 h-4 w-4" />
            {isSeeding ? 'Populando...' : 'Popular Vade Mecum'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}