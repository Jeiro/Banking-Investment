"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative h-1 bg-navy-border rounded-full mb-6">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-blue to-brand-emerald rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep

          return (
            <div key={step.number} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isCompleted && "bg-brand-emerald text-white shadow-lg shadow-emerald-500/30",
                  isCurrent && "bg-brand-blue text-white shadow-lg shadow-blue-500/30 scale-110",
                  !isCompleted && !isCurrent && "bg-navy-border text-white/30"
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs hidden sm:block transition-colors",
                  isCurrent ? "text-white font-medium" : "text-white/30"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}