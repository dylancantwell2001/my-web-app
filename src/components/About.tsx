import { useState } from "react";
import { Info, X } from "lucide-react";

const About = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-primary/70 hover:text-primary backdrop-blur-md pointer-events-auto"
                title="About"
            >
                <Info className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-md p-8 rounded-3xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in z-10">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-6">
                            <h2 className="text-2xl font-bold text-primary font-serif italic">About</h2>

                            <div className="space-y-4">
                                <p className="conversational-text text-lg text-foreground/90 leading-relaxed">
                                    "As we age, we create routines to keep ourselves efficient, but with routine, days blend together so our minds let go of them. This allows us to stay productive but keep days feeling fresh. Make your schedule interesting."
                                </p>

                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-muted-foreground text-sm mb-2">Designed by</p>
                                    <a
                                        href="https://dylancantwell.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-primary/80 transition-colors font-medium text-lg inline-flex items-center gap-1 hover:underline underline-offset-4"
                                    >
                                        Dylan Cantwell
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default About;
