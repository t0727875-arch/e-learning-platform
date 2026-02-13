import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Support from "@/pages/Support";
import Donation from "@/pages/Donation";
import Paths from "@/pages/Paths";
import PathDetail from "@/pages/PathDetail";
import Courses from "@/pages/Courses";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import CertificateVerify from "@/pages/CertificateVerify";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import PracticeQuiz from "@/pages/PracticeQuiz";
import Classroom from "@/pages/Classroom";
import Login from "@/pages/Login";
import Subscribe from "@/pages/Subscribe";
import CourseDetail from "@/pages/CourseDetail";
import ChapterViewer from "@/pages/ChapterViewer";
import LessonQuiz from "@/pages/LessonQuiz";
import CourseQuiz from "@/pages/CourseQuiz";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/about" component={About} />
      <Route path="/support" component={Support} />
      <Route path="/donate" component={Donation} />
      <Route path="/paths" component={Paths} />
      <Route path="/paths/:id" component={PathDetail} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/courses/:id/learn" component={CourseDetail} />
      <Route path="/courses/:courseId/content/:contentId" component={ChapterViewer} />
      <Route path="/courses/:courseId/lessons/:lessonId/quiz" component={LessonQuiz} />
      <Route path="/courses/:courseId/quiz" component={CourseQuiz} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/:rest*" component={Dashboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/verify" component={CertificateVerify} />
      <Route path="/certificates" component={Dashboard} />
      <Route path="/classroom" component={Classroom} />
      <Route path="/practice-quiz" component={PracticeQuiz} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/teacher/:rest*" component={TeacherDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:rest*" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
