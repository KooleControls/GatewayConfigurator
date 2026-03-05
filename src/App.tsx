import { ThemeSwitcher } from "@/components/theme-switcher"
import { CommandsCard } from "./commands-card";
import { SettingsCard } from "./settings-card";

export function App() {
	return (
		<main className="flex h-screen flex-col bg-background text-foreground">
			<header className="border-b border-border">
				<div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
					<h1 className="text-sm font-medium">Gateway Configuration</h1>
					<ThemeSwitcher />
				</div>
			</header>

			<div className="mx-auto grid h-full w-full max-w-7xl flex-1 grid-cols-1 gap-4 p-4 min-h-0 lg:grid-cols-2">
				<div className="min-h-0">
					<SettingsCard />
				</div>
				<div className="min-h-0">
					<CommandsCard />
				</div>
			</div>


		</main>
	)
}

export default App;
