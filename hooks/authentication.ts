import firebase from 'firebase/app'
import { useEffect } from 'react'
import { atom, useRecoilState } from 'recoil'
import { User } from '@/models/User'

const userState = atom<User>({
  key: 'user',
  default: null,
})

const createUserIfNotFound = async (user: User) => {
  const userRef = firebase.firestore().collection('Users').doc(user.uid)
  const doc = await userRef.get()

  if (doc.exists) return

  await userRef.set({
    name: 'taro' + new Date().getTime(),
  })
}

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState)

  // DOMがマウントされたタイミングで実行される
  // 第2引数に空の配列、身体と最初の1度しか実行されない
  useEffect(() => {
    if (user !== null) return

    firebase
      .auth()
      .signInAnonymously()
      .catch((error) => {
        // error
        const errorCode = error.code
        const errorMessage = error.message
      })

    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: '',
        }
        createUserIfNotFound(loginUser)
        setUser(loginUser)
      } else {
        setUser(null)
      }
    })
  }, [])

  return { user }
}
