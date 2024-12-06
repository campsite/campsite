export function EmptySearchResults() {
  return (
    <div className='flex flex-1 items-center justify-center py-24'>
      <div className='flex flex-col text-center'>
        <div className='group relative h-32 w-full'>
          <div className='bg-elevated absolute left-1/2 h-24 w-20 -translate-x-1/2 rotate-[5deg] rounded-md border border-neutral-200 shadow transition group-hover:rotate-[9deg] group-hover:scale-105 group-hover:shadow-md dark:border-neutral-700'></div>
          <div className='bg-elevated absolute left-1/2 h-24 w-20 -translate-x-1/2 -rotate-[5deg] rounded-md border border-neutral-200 shadow transition group-hover:-rotate-[9deg] group-hover:scale-105 group-hover:shadow-md dark:border-neutral-700'></div>
        </div>
        <div className='text-sm font-medium'>No search results found.</div>
      </div>
    </div>
  )
}
