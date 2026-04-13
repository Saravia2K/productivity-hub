interface ErrorMessageProps {
  children: React.ReactNode
}

export function ErrorMessage({ children }: ErrorMessageProps) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
      {children}
    </p>
  )
}
