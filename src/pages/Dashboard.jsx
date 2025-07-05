import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, HelpCircle, LayoutDashboard } from 'lucide-react';
import { getVadeMecumStats } from '../services/vadeMecumService';
import { getQuestionsStats } from '../services/questionsService';

export function DashboardPage() {
  const [vadeMecumStats, setVadeMecumStats] = useState(null);
  const [questionsStats, setQuestionsStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vadeMecumRes, questionsRes] = await Promise.all([
          getVadeMecumStats(),
          getQuestionsStats()
        ]);

        if (vadeMecumRes.success) {
          setVadeMecumStats(vadeMecumRes.stats);
        }
        if (questionsRes.success) {
          setQuestionsStats(questionsRes.stats);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Prepara os dados para o gráfico
  const chartData = vadeMecumStats ? Object.entries(vadeMecumStats.tipos).map(([name, value]) => ({ name, quantidade: value })) : [];

  if (loading) {
    return <div>Carregando estatísticas...</div>;
  }

  return (
    <div className="space-y-6 w-200">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 text-gray-100 border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docs Vade Mecum</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vadeMecumStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total de documentos</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 text-gray-100 border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matérias de Quiz</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionsStats?.totalSubjects || 0}</div>
            <p className="text-xs text-muted-foreground">Total de matérias</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 text-gray-100 border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questões de Quiz</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionsStats?.totalQuestions || 0}</div>
            <p className="text-xs text-muted-foreground">Total de questões</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="bg-gray-900 text-gray-100 border border-gray-800">
        <CardHeader>
          <CardTitle>Distribuição de Documentos do Vade Mecum</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={chartData}
    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
  >
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#333" // Linhas mais escuras
    />
    <XAxis
      dataKey="name"
      stroke="#ccc" // Eixos mais visíveis no escuro
      fontSize={12}
    />
    <YAxis
      stroke="#ccc"
      fontSize={12}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: "#1f2937", // bg-gray-800
        borderColor: "#4b5563", // border-gray-600
        color: "#f9fafb", // text-gray-100
      }}
      labelStyle={{ color: "#f9fafb" }}
      itemStyle={{ color: "#f9fafb" }}
    />
    <Bar
      dataKey="quantidade"
      fill="black" // cor verde (bg-green-500)
      radius={[4, 4, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>

        </CardContent>
      </Card>
    </div>
  );
}