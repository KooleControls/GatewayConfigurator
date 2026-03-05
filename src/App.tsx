import { ThemeSwitcher } from "@/components/theme-switcher"
import {
	RawCommandsPanel,
	SettingsFeaturesPanel,
} from "@/features/settings/settings-card.tsx"

export function App() {
	return (
		<main className="min-h-screen bg-background">
			<header className="border-b border-border">
				<div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
					<h1 className="text-sm font-medium">Gateway Configuration</h1>
					<ThemeSwitcher />
				</div>
			</header>

			<div className="mx-auto grid h-[calc(100vh-3.5rem)] w-full max-w-7xl gap-4 p-4 lg:grid-cols-2">
				<SettingsFeaturesPanel />
				<RawCommandsPanel />
			</div>
		</main>
	)
}

export default App;
