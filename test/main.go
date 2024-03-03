// Go-Lang
package main

import (
  "fmt"
  "net/http"
  "io/ioutil"
)

func main() {
  url := "/api/data"
  resp, err := http.Get(url)
  if err != nil {
    fmt.Println("Error:", err)
    return
  }
  defer resp.Body.Close()

  body, err := ioutil.ReadAll(resp.Body)
  if err != nil {
    fmt.Println("Error:", err)
    return
  }

  fmt.Println(string(body))
}