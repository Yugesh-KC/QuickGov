package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly"
)

type press_release struct {
	date  string `selector:"td:nth-child(1)"`
	title string `selector:"td:nth-child(2) > a"`
	url   string `selector:"td:nth-child(2) > a[href]" attr:"href"`
}

type image_data struct {
	page_url  string
	image_url string
}

func main() {
	c := colly.NewCollector(colly.Async(true), colly.CacheDir("./colly_cache"))
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 3,
		Delay:       2 * time.Second,
	})

	var press_releases []press_release
	var images []image_data
	var wg sync.WaitGroup

	c.OnHTML("table tbody", func(e *colly.HTMLElement) {
		e.ForEach("tr", func(_ int, el *colly.HTMLElement) {
			pr := &press_release{}
			err := el.Unmarshal(pr)
			if err != nil {
				fmt.Println("Error unmarshalling:", err)
				return
			}
			full_title := el.ChildText("td:nth-child(2) > a")
			lines := strings.Split(full_title, "\n")
			if len(lines) > 0 {
				pr.title = strings.TrimSpace(lines[0])
			}
			pr.date = el.ChildText("td:nth-child(1)")
			pr.url = el.ChildAttr("td:nth-child(2) > a", "href")
			press_releases = append(press_releases, *pr)
		})
	})

	startURL := "https://www.moha.gov.np/en/page/press-release?page="
	page := 1
	var maxPage = 4
	for {
		fmt.Printf("Visiting page %d...\n", page)

		err := c.Visit(fmt.Sprintf("%s%d", startURL, page))
		if err != nil {
			fmt.Println("Error visiting:", err)
			break
		}

		c.Wait()

		// c.OnHTML("li.page-item:nth-child(14) > button:nth-child(1)", func(e *colly.HTMLElement) {
		// 	maxPageStr := e.Text
		// 	currentMaxPage, err := strconv.Atoi(maxPageStr)

		// 	if err == nil {
		// 		maxPage = currentMaxPage
		// 		fmt.Printf("Maximum page number is: %d\n", maxPage)
		// 	}
		// })

		if page > maxPage {
			fmt.Printf("Reached maximum page number: %d\n", maxPage)
			break
		}

		page++
	}

	for _, pr := range press_releases {
		wg.Add(1)
		go func(pr press_release) {
			defer wg.Done()

			imageCollector := colly.NewCollector()

			imageCollector.OnHTML(".col-lg-9 > a:nth-child(7) > img:nth-child(1)", func(e *colly.HTMLElement) {
				imgSrc := e.Attr("src")
				pageUrl := e.Request.URL.String()
				if imgSrc != "" {
					images = append(images, image_data{page_url: pageUrl, image_url: imgSrc})
					pr.url = imgSrc
					return
				}
			})

			imageCollector.OnHTML(".table > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)", func(e *colly.HTMLElement) {
				link := e.Attr("href")
				pageUrl := e.Request.URL.String()
				if link != "" {
					images = append(images, image_data{page_url: pageUrl, image_url: link})
					pr.url = link
				}
			})

			err := imageCollector.Visit(pr.url)
			if err != nil {
				fmt.Println("Error visiting press release URL:", err)
			}
		}(pr)
	}

	wg.Wait()

	// fmt.Println("Collected Press Releases:")
	// for _, pr := range press_releases {
	// 	fmt.Printf("Date: %s, Title: %s, URL: %s\n", pr.date, pr.title, pr.url)
	// }

	fmt.Println("\nCollected Image URLs:")
	for _, img := range images {
		// fmt.Printf("Page: %s, Image: %s\n", img.page_url, img.image_url)

		for i := range press_releases {
			if press_releases[i].url == img.page_url {
				press_releases[i].url = img.image_url
			}
		}
	}

	fmt.Println("\nCollected Data:")
	for _, pr := range press_releases {
		fmt.Printf("Date: %s, Title: %s,  URL: %s\n", pr.date, pr.title, pr.url)
		saveImage(pr.url, fmt.Sprintf("scraped-images/moha/%s", strings.ReplaceAll(pr.date, " ", "_")))
	}
}

func saveImage(url string, baseFilename string) {

	os.MkdirAll("scraped-images/moha", os.ModePerm)
	ext := filepath.Ext(url)
	if ext == "" {
		resp, err := http.Head(url)
		if err != nil || resp.StatusCode != http.StatusOK {
			fmt.Println("Error checking URL:", url)
			return
		}
		contentType := resp.Header.Get("Content-Type")
		switch contentType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "application/pdf":
			ext = ".pdf"
		default:
			fmt.Println("Unsupported content type:", contentType)
			return
		}
	}

	filename := fmt.Sprintf("%s%s", baseFilename, ext)
	out, err := os.Create(filename)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer out.Close()

	response, err := http.Get(url)
	if err != nil {
		fmt.Println("Error downloading file:", err)
		return
	}
	defer response.Body.Close()

	_, err = io.Copy(out, response.Body)
	if err != nil {
		fmt.Println("Error saving file:", err)
		return
	}

	fmt.Printf("File saved to %s\n", filename)
}
