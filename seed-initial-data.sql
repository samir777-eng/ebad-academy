-- Insert initial levels
INSERT INTO "Level" ("levelNumber", "nameAr", "nameEn", "descriptionAr", "descriptionEn", "order") VALUES
(1, 'المستوى الأول - الأساسيات', 'Level 1 - Fundamentals', 'تعلم أساسيات الإسلام', 'Learn the fundamentals of Islam', 1),
(2, 'المستوى الثاني - المتوسط', 'Level 2 - Intermediate', 'تعمق في فهم الإسلام', 'Deepen your understanding of Islam', 2),
(3, 'المستوى الثالث - المتقدم', 'Level 3 - Advanced', 'دراسة متقدمة للإسلام', 'Advanced study of Islam', 3),
(4, 'المستوى الرابع - الإتقان', 'Level 4 - Mastery', 'إتقان العلوم الإسلامية', 'Master Islamic sciences', 4)
ON CONFLICT ("levelNumber") DO NOTHING;

-- Insert initial branches
INSERT INTO "Branch" ("nameAr", "nameEn", "icon", "slug", "order") VALUES
('العقيدة', 'Aqeedah', '🕌', 'aqeedah', 1),
('الفقه', 'Fiqh', '📖', 'fiqh', 2),
('السيرة', 'Seerah', '📚', 'seerah', 3),
('الأخلاق', 'Akhlaq', '💎', 'akhlaq', 4),
('القرآن', 'Quran', '📕', 'quran', 5)
ON CONFLICT ("slug") DO NOTHING;

