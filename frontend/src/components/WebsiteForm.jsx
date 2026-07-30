import React, { useState } from 'react';

const WebsiteForm = () => {
  const [url, setUrl] = useState('')
  const [keywords, setKeywords] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const data = {
      url,
      keywords: keywords.split(',').map(k => k.trim())
    }

    console.log(data)
    alert('Analysis request submitted!')

    // Later: send to backend with axios
  }

  return (
    <div className='max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mt-10'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800 dark:text-white'>
        Website SEO Analysis
      </h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block mb-2 font-medium text-gray-700 dark:text-gray-200'>
            Website URL
          </label>
          <input
            type='url'
            placeholder='https://example.com'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className='w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block mb-2 font-medium text-gray-700 dark:text-gray-200'>
            Target Keywords
          </label>
          <textarea
            rows='4'
            placeholder='seo tools, rank tracker, website optimization'
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            required
            className='w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <p className='text-sm text-gray-500 mt-1'>
            Separate keywords with commas
          </p>
        </div>

        <button
          type='submit'
          className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition'
        >
          Analyze Website
        </button>
      </form>
    </div>
  )
}

export default WebsiteForm