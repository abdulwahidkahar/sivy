import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-20 w-20 object-contain" />
        </div>
    );
}
