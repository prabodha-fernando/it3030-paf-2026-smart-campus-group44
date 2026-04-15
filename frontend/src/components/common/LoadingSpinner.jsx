const LoadingSpinner = ({ size = 'md', center = false }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={center ? 'flex items-center justify-center min-h-screen' : 'flex justify-center p-4'}>
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-stone-200 border-t-primary-600`} />
    </div>
  )
}

export default LoadingSpinner