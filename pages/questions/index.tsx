import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import dayjs from 'dayjs'
import Link from 'next/link'

import { Question } from '@/models/Question'
import { useAuthentication } from '@/hooks/authentication'
import Layout from '@/components/Layout'

export default function QuestionsReceived() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isPaginationFinished, setIsPaginationFinished] = useState(false)
  const { user } = useAuthentication()

  useEffect(() => {
    if (!process.browser) return
    if (user === null) return

    async function loadQuestions() {
      const snapshot = await firebase
        .firestore()
        .collection('Questions')
        .where('receiverUid', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get()

      if (snapshot.empty) return

      const gotQuestions = snapshot.docs.map((doc) => {
        const question = doc.data() as Question
        question.id = doc.id
        return question
      })
      setQuestions(gotQuestions)
    }

    loadQuestions()
  }, [process.browser, user])

  return (
    <Layout>
      <h1 className="h4">質問一覧</h1>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {questions.map((question) => (
            <Link
              href="/questions/[id]"
              as={`/questions/${question.id}`}
              key={question.id}
            >
              <a>
                <div className="card my-3" key={question.id}>
                  <div className="card-body">
                    <div className="text-truncate">{question.body}</div>
                    <div className="text-muted text-right">
                      <small>
                        {dayjs(question.createdAt.toDate()).format(
                          'YYYY/MM/DD HH:mm'
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
