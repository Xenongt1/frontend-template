import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({ component: Home })

function Home() {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>{t('welcome')}</h1>
            <p>{t('description')}</p>

            <div style={{ marginTop: '1rem', gap: '0.5rem', display: 'flex' }}>
                <button onClick={() => handleLanguageChange('en')}>English</button>
                <button onClick={() => handleLanguageChange('es')}>Español</button>
            </div>
        </div>
    );
}
