import styles from './styles/App.module.css'

function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Пример с CSS Modules</h1>
      <p className={styles.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      <p className={styles.text}>
        В нормальной IDE теперь должны появляться автоподсказки для styles.container, styles.title и
        styles.text.
      </p>
    </div>
  )
}
export default App
