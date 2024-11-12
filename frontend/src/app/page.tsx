'use client'

import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

interface EnrichedData {
  company_name: string
  website: string
  description: string
  industry: string
  estimated_size: string
  products_services: string[]
  headquarters: string
  year_founded: string
  key_features: string[]
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null)
  const [isThereData, setIsThereData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      setError('Failed to log in. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      setIsThereData(false);
      setEnrichedData(null);
      await auth.signOut();
    } catch (error) {
      setError('Failed to log out. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEnrichedData(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_name: companyName, website: websiteUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch enriched data')
      }

      const data = await response.json()
      setEnrichedData(data)
      setIsThereData(true)
    } catch (error) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while fetching enriched data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Lead Enrichment Preview Tool</CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <Button onClick={handleLogin} className="w-full">
              Log in with Google
            </Button>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enriching...
                    </>
                  ) : (
                    'Enrich Lead'
                  )}
                </Button>
              </form>
              <Button onClick={handleLogout} variant="outline" className="w-full mt-4">
                Log out
              </Button>
            </>
          )}
          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
          {isThereData ? (
            enrichedData &&
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-xl">Enriched Data</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-semibold">Company Name:</dt>
                    <dd>{enrichedData.company_name}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Website:</dt>
                    <dd>{enrichedData.website}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Description:</dt>
                    <dd>{enrichedData.description}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Industry:</dt>
                    <dd>{enrichedData.industry}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Estimated Size:</dt>
                    <dd>{enrichedData.estimated_size}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Products/Services:</dt>
                    <dd>{enrichedData.products_services.join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Headquarters:</dt>
                    <dd>{enrichedData.headquarters}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Year Founded:</dt>
                    <dd>{enrichedData.year_founded}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Key Features:</dt>
                    <dd>{enrichedData.key_features.join(', ')}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}