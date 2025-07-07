import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, HelpCircle, LayoutDashboard, TrendingUp } from 'lucide-react';
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
  const chartData = vadeMecumStats ? Object.entries(vadeMecumStats.tipos).map(([name, quantidade]) => ({ name, quantidade })) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600/20 rounded-lg">
          <LayoutDashboard className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Dashboard</h1>
          <p className="text-gray-400">Visão geral do sistema de administração</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Docs Vade Mecum</CardTitle>
            <div className="p-2 bg-green-600/20 rounded-lg">
              <FileText className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-50">{vadeMecumStats?.total || 0}</div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Total de documentos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Matérias de Quiz</CardTitle>
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-50">{questionsStats?.totalSubjects || 0}</div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Total de matérias
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Questões de Quiz</CardTitle>
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <HelpCircle className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-50">{questionsStats?.totalQuestions || 0}</div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Total de questões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-50 flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-400" />
            Distribuição de Documentos do Vade Mecum
          </CardTitle>
          <p className="text-gray-400 text-sm">Visualização por tipo de documento</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                  color: "#F9FAFB",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#F9FAFB" }}
                itemStyle={{ color: "#60A5FA" }}
              />
              <Bar
                dataKey="quantidade"
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

