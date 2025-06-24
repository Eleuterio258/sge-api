import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import { Dashboard } from "./components/Dashboard";
 
import NotFound from "./pages/NotFound";
 
import { EscolasPage } from "./pages/EscolasPage";

import { UserRole, ROLE_PERMISSIONS } from "./types/auth";

import FinancialDashboard from "./pages/FinancialDashboard";
import FinancialReports from "./pages/FinancialReports";
import InstructorDashboard from "./pages/InstructorDashboard";
import PaymentsManagement from "./pages/PaymentsManagement";
import SchoolsManagement from "./pages/SchoolsManagement";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SystemReports from "./pages/SystemReports";
import UsersManagement from "./pages/UsersManagement";
import UserSchoolAssignment from "./pages/UserSchoolAssignment";
import UnauthorizedPage from "./components/UnauthorizedPage";
import StudentManagements from "./pages/StudentManagements";
import StudentManagementsDetails from "./pages/StudentManagementsDetails";
import LessonsManagement from "./pages/LessonsManagement";
import VehiclesManagement from "./pages/VehiclesManagement";
import StudentsPage from './pages/StudentsPage';
import VehiclesPage from './pages/VehiclesPage';
import LessonsPage from './pages/LessonsPage';
import InstructorPage from './pages/InstructorPage';
 
// Componente para verificar permissões específicas
function PermissionRoute({ 
  children, 
  allowedRoles,
  requiredPermission 
}: { 
  children: JSX.Element;
  allowedRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: string;
  };
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o role é permitido
  if (allowedRoles && !allowedRoles.includes(user.id_tipo_utilizador)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verifica permissões específicas
  if (requiredPermission) {
    const userPermissions = ROLE_PERMISSIONS[user.id_tipo_utilizador];
    const hasPermission = userPermissions.some(permission => 
      permission.resource === requiredPermission.resource &&
      permission.actions.includes(requiredPermission.action)
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

// Componente de rota privada com redirecionamento baseado em role
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Componente para redirecionar para dashboard baseado no role
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redireciona baseado no role do usuário
  const roleRoutes = {
    1: '/admin/dashboard',      // Super Admin
    2: '/dashboard',            // Local Admin
    3: '/financial/dashboard',  // Financial Manager
    4: '/instructor/dashboard', // Instructor
    5: '/secretary/dashboard',  // Secretary
    6: '/student/dashboard'     // Student
  };

  const redirectPath = roleRoutes[user.id_tipo_utilizador as keyof typeof roleRoutes] || '/dashboard';
  return <Navigate to={redirectPath} replace />;
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
    <Routes>
        {/* Rota pública de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rota de acesso negado */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rotas principais com Layout */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Redireciona para dashboard baseado no role */}
          <Route index element={<RoleBasedRedirect />} />
          
          {/* Dashboard geral (para Local Admin e outros) */}
          <Route 
            path="dashboard" 
            element={
              <PermissionRoute allowedRoles={[1, 2, 3, 4, 5]}>
                <Dashboard />
              </PermissionRoute>
            } 
          />
          
       
          
      
          {/* Gestão de escolas - apenas Super Admin e Local Admin */}
          // ROTA REMOVIDA: <Route path="escolas" element={<PermissionRoute requiredPermission={{ resource: 'schools', action: 'read' }}><EscolasPage /></PermissionRoute>} />
          
          {/* Rotas adicionais para itens do sidebar */}
          <Route 
            path="lessons" 
            element={
              <PermissionRoute allowedRoles={[1, 2, 4]}>
                <LessonsManagement />
              </PermissionRoute>
            } 
          />
          
          <Route 
            path="vehicles" 
            element={
              <PermissionRoute allowedRoles={[1, 2]}>
                <VehiclesManagement />
              </PermissionRoute>
            } 
          />
        </Route>

        {/* Dashboards específicos por role */}
        
        {/* Super Admin Dashboard */}
        <Route 
          path="/admin/*" 
          element={
            <PermissionRoute allowedRoles={[1]}>
              <Layout />
            </PermissionRoute>
          }
        >
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="schools" element={<SchoolsManagement />} />
          <Route path="student-managements" element={<StudentManagements />} />
          <Route path="student-managements/:id" element={<StudentManagementsDetails />} />
          <Route path="reports" element={<SystemReports />} />
          <Route path="user-school-assignment" element={<UserSchoolAssignment />} />
        </Route>

        {/* Financial Manager Dashboard */}
        <Route 
          path="/financial/*" 
          element={
            <PermissionRoute allowedRoles={[3]}>
              <Layout />
            </PermissionRoute>
          }
        >
          <Route path="dashboard" element={<FinancialDashboard />} />
          <Route path="payments" element={<PaymentsManagement />} />
          <Route path="reports" element={<FinancialReports />} />
        </Route>

        {/* Instructor Dashboard */}
        <Route 
          path="/instructor/*" 
          element={
            <PermissionRoute allowedRoles={[4]}>
              <Layout />
            </PermissionRoute>
          }
        >
          <Route path="dashboard" element={<InstructorDashboard />} />
          {/* TODO: Implement LessonsManagement and InstructorStudents components */}
        </Route>

        {/* Secretary Dashboard */}
        <Route 
          path="/secretary/*" 
          element={
            <PermissionRoute allowedRoles={[5]}>
              <Layout />
            </PermissionRoute>
          }
        >
          <Route path="dashboard" element={<SchoolsManagement />} />
          <Route path="students" element={<UsersManagement />} />
          <Route path="schedule" element={<SystemReports />} />
        </Route>

        {/* Student Dashboard */}
        <Route 
          path="/student/*" 
          element={
            <PermissionRoute allowedRoles={[6]}>
              <Layout />
            </PermissionRoute>
          }
        >
          <Route path="dashboard" element={<div>Student Dashboard</div>} />
          <Route path="lessons" element={<div>Student Lessons</div>} />
          <Route path="progress" element={<div>Student Progress</div>} />
        </Route>

        {/* Admin Local Dashboard e rotas */}
        <Route 
          path="/local-admin/*" 
          element={
            <PermissionRoute allowedRoles={[2]}>
              <Layout />
            </PermissionRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="instructors" element={<InstructorPage />} />
          {/* Outras rotas do admin local podem ser adicionadas aqui */}
        </Route>

        {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;