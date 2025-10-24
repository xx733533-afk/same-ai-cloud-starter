import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Navigation
      'nav.dashboard': 'لوحة التحكم',
      'nav.projects': 'المشاريع',
      'nav.settings': 'الإعدادات',
      'nav.workspace': 'مساحة العمل',
      
      // Common
      'common.create': 'إنشاء',
      'common.edit': 'تعديل',
      'common.delete': 'حذف',
      'common.save': 'حفظ',
      'common.cancel': 'إلغاء',
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      
      // Projects
      'projects.title': 'المشاريع',
      'projects.create_new': 'إنشاء مشروع جديد',
      'projects.no_projects': 'لا توجد مشاريع بعد',
      'projects.create_first': 'أنشئ مشروعك الأول للبدء',
      'projects.name': 'اسم المشروع',
      'projects.framework': 'الإطار',
      'projects.language': 'اللغة',
      'projects.created': 'تاريخ الإنشاء',
      'projects.last_accessed': 'آخر وصول',
      'projects.status': 'الحالة',
      'projects.ready': 'جاهز',
      
      // AI Chat
      'chat.title': 'المساعد الذكي',
      'chat.placeholder': 'اسأل المساعد الذكي...',
      'chat.start_conversation': 'ابدأ محادثة مع المساعد الذكي',
      'chat.ask_questions': 'اسأل أسئلة حول الكود أو اطلب المساعدة في التطوير',
      'chat.thinking': 'المساعد يفكر...',
      
      // Code Editor
      'editor.title': 'محرر الأكواد',
      'editor.files': 'الملفات',
      'editor.no_file_selected': 'لم يتم اختيار ملف',
      'editor.select_file': 'اختر ملف من قائمة الملفات',
      'editor.save': 'حفظ',
      'editor.run': 'تشغيل',
      'editor.terminal': 'الطرفية',
      
      // Live Preview
      'preview.title': 'المعاينة المباشرة',
      'preview.no_server': 'لا يوجد خادم تطوير يعمل',
      'preview.start_project': 'ابدأ مشروعك لرؤية المعاينة المباشرة',
      'preview.error': 'خطأ في المعاينة',
      'preview.retry': 'إعادة المحاولة',
      'preview.refresh': 'تحديث',
      'preview.open_new_tab': 'فتح في تبويب جديد',
      
      // Settings
      'settings.title': 'الإعدادات',
      'settings.description': 'قم بتكوين تفضيلات مساعد الترميز الذكي',
      'settings.default_language': 'اللغة الافتراضية',
      'settings.default_framework': 'الإطار الافتراضي',
      'settings.ai_model': 'نموذج الذكاء الاصطناعي',
      
      // Frameworks
      'framework.react': 'React',
      'framework.nextjs': 'Next.js',
      'framework.vue': 'Vue.js',
      'framework.svelte': 'Svelte',
      'framework.angular': 'Angular',
      'framework.vite': 'Vite',
      
      // Languages
      'language.arabic': 'العربية',
      'language.english': 'English',
      
      // AI Models
      'ai.gpt4': 'GPT-4 Turbo',
      'ai.claude': 'Claude 3.5 Sonnet',
    }
  },
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.projects': 'Projects',
      'nav.settings': 'Settings',
      'nav.workspace': 'Workspace',
      
      // Common
      'common.create': 'Create',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      
      // Projects
      'projects.title': 'Projects',
      'projects.create_new': 'Create New Project',
      'projects.no_projects': 'No projects yet',
      'projects.create_first': 'Create your first project to start building with AI assistance',
      'projects.name': 'Project Name',
      'projects.framework': 'Framework',
      'projects.language': 'Language',
      'projects.created': 'Created',
      'projects.last_accessed': 'Last Accessed',
      'projects.status': 'Status',
      'projects.ready': 'Ready',
      
      // AI Chat
      'chat.title': 'AI Assistant',
      'chat.placeholder': 'Ask the AI assistant...',
      'chat.start_conversation': 'Start a conversation with the AI assistant',
      'chat.ask_questions': 'Ask questions about your code or request help with development',
      'chat.thinking': 'AI is thinking...',
      
      // Code Editor
      'editor.title': 'Code Editor',
      'editor.files': 'Files',
      'editor.no_file_selected': 'No file selected',
      'editor.select_file': 'Select a file from the file tree',
      'editor.save': 'Save',
      'editor.run': 'Run',
      'editor.terminal': 'Terminal',
      
      // Live Preview
      'preview.title': 'Live Preview',
      'preview.no_server': 'No development server running',
      'preview.start_project': 'Start your project to see the live preview',
      'preview.error': 'Preview Error',
      'preview.retry': 'Retry',
      'preview.refresh': 'Refresh',
      'preview.open_new_tab': 'Open in New Tab',
      
      // Settings
      'settings.title': 'Settings',
      'settings.description': 'Configure your AI Coding Assistant preferences',
      'settings.default_language': 'Default Language',
      'settings.default_framework': 'Default Framework',
      'settings.ai_model': 'AI Model',
      
      // Frameworks
      'framework.react': 'React',
      'framework.nextjs': 'Next.js',
      'framework.vue': 'Vue.js',
      'framework.svelte': 'Svelte',
      'framework.angular': 'Angular',
      'framework.vite': 'Vite',
      
      // Languages
      'language.arabic': 'العربية',
      'language.english': 'English',
      
      // AI Models
      'ai.gpt4': 'GPT-4 Turbo',
      'ai.claude': 'Claude 3.5 Sonnet',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;