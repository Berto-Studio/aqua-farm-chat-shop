import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  image?: string;
}

export const AuthLayout = ({ children, image }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-theme-white lg:flex lg:h-screen lg:overflow-hidden">
      <div className="flex w-full items-start justify-center px-4 py-8 sm:px-6 md:px-8 lg:w-1/2 lg:overflow-y-auto lg:py-10">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2 overflow-hidden bg-gradient-to-br from-theme-green to-theme-dark-green">
        <div className="absolute inset-0 bg-[url('/logi-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 to-black/80"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-theme-white p-8 text-center max-w-md">
            <div className="rounded-full bg-white/10 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="rounded-full bg-green-500 w-16 h-16 animate-pulse flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-theme-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Welcome to Pomegrid Aqua
            </h2>
            <p className="text-lg text-theme-white/80">
              Fresh aquaculture products, trusted service, and simple account
              access for customers who want a smoother farm-to-table
              experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
