import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, GraduationCap, BrainCircuit, BarChart, CheckCircle, Notebook, Timer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
	{
		icon: <Notebook className="h-8 w-8 text-primary" />,
		title: 'Smart Note-Taking',
		description:
			'Organize your thoughts with our intuitive rich-text editor. Save, edit, and access your notes anytime.',
	},
	{
		icon: <BrainCircuit className="h-8 w-8 text-primary" />,
		title: 'AI Summarizer',
		description:
			'Upload documents or paste text to get concise, AI-powered summaries in seconds. Powered by Gemini.',
	},
	{
		icon: <CheckSquare className="h-8 w-8 text-primary" />,
		title: 'To-Do List',
		description:
			'Manage your tasks with daily to-do lists and a weekly planner to keep your schedule organized.',
	},
	{
		icon: <Timer className="h-8 w-8 text-primary" />,
		title: 'Pomodoro Timer',
		description:
			'Boost your focus with the integrated Pomodoro timer. Track your study sessions and stay productive.',
	},
	{
		icon: <BarChart className="h-8 w-8 text-primary" />,
		title: 'Analytics Dashboard',
		description:
			'Visualize your progress. Track notes created and Pomodoro sessions completed to stay motivated.',
	},
];

export default function LandingPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 max-w-screen-2xl items-center justify-between">
					<Link href="/" className="flex items-center gap-2">
						<GraduationCap className="h-6 w-6 text-primary" />
						<span className="font-bold">StudyForge</span>
					</Link>
					<nav className="flex items-center gap-4">
						<Button variant="ghost" asChild>
							<Link href="/login">Login</Link>
						</Button>
						<Button asChild>
							<Link href="/signup">Get Started</Link>
						</Button>
					</nav>
				</div>
			</header>

			<main className="flex-1">
				{/* Hero Section - Full Page */}
				<section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
					<div className="container px-4 md:px-6">
						<div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
							<div className="space-y-8">
								<div className="space-y-6">
									<h1 className="text-4xl font-extrabold tracking-tight sm:text-4xl md:text-6xl lg:text-6xl">
										Unlock Your Learning Power with
										<br />
										<span className="text-primary">
											Purpose-Built Study Tools
										</span>
									</h1>
									<p className="text-xl text-muted-foreground sm:text-xl leading-relaxed">
										Built for modern learners, StudyForge brings all your
										study tools into one intelligent platform, helping you
										focus better, retain more, and achieve your academic
										goals.
									</p>
								</div>

								<div className="space-y-4">
									<div className="flex flex-col sm:flex-row gap-4">
										<Button asChild size="lg" className="text-lg px-8 py-6">
											<Link href="/signup">Get Started For Free</Link>
										</Button>
										<Button
											variant="outline"
											asChild
											size="lg"
											className="text-lg px-8 py-6"
										>
											<Link href="#features">Explore Features</Link>
										</Button>
									</div>

									<div className="flex items-center gap-4 text-sm text-muted-foreground">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span>Free to start</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span>AI-powered</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span>All-in-one platform</span>
										</div>
									</div>
								</div>
							</div>

							<div className="relative">
								<div className="rounded-xl overflow-hidden shadow-2xl bg-card border">
									<Image
										src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
										alt="Study Zone Preview"
										width={600}
										height={400}
										className="w-full h-auto"
										data-ai-hint="digital learning"
									/>
								</div>
								<div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
								<div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					id="features"
					className="py-20 bg-slate-50/50 dark:bg-slate-900/20"
				>
					<div className="container px-4 md:px-6">
						<div className="mx-auto max-w-4xl text-center mb-16">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
								Everything you need to study smarter
							</h2>
							<p className="text-xl text-muted-foreground leading-relaxed">
								Powerful tools designed to help you learn more efficiently and
								achieve better results.
							</p>
						</div>

						<div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
							{features.map((feature, index) => (
								<Card
									key={feature.title}
									className="text-center transition-all duration-300 hover:scale-105 hover:shadow-xl border border-primary/30 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm"
								>
									<CardHeader className="pb-4">
										<div className="flex justify-center mb-4">
											<div className="p-3 rounded-full bg-primary/20">
												{feature.icon}
											</div>
										</div>
										<CardTitle className="text-xl">
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground leading-relaxed">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-primary/5">
					<div className="container px-4 md:px-6">
						<div className="mx-auto max-w-4xl text-center space-y-8">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
								Ready to transform your learning?
							</h2>
							<p className="text-xl text-muted-foreground">
								Join thousands of students who are already using StudyForge to
								achieve their academic goals.
							</p>
							<Button asChild size="lg" className="text-lg px-8 py-6">
								<Link href="/signup">Start Your Journey Today</Link>
							</Button>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t py-12 bg-background">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div className="flex items-center gap-2">
							<GraduationCap className="h-5 w-5 text-primary" />
							<span className="font-semibold">StudyForge</span>
						</div>
						<p className="text-sm text-muted-foreground">
							© {new Date().getFullYear()} StudyForge. Built by Md Rizwan Molla.
							All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}