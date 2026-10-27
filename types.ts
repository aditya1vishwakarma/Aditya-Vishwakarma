
export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  date: string;
  role: string;
  path: string; // Added to match Blog structure
  isRedirect?: boolean; // Card that links elsewhere on the site, not a project itself
  isSelected?: boolean; // Listed under Selected Works on /works
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  category: string;
  path: string;
  content: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface MoodBoardItem {
  id: string;
  title: string;
  imageUrl: string;
  tags: string[];
  description: string;
  link?: string;
  orientation?: 'landscape' | 'portrait';
  cols?: number;
}
