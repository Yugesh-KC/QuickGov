package main

import (
	"fmt"
	"strings"
	"sync"

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
	c := colly.NewCollector(colly.Async(true))
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 2,
	})
	var press_releases []press_release
	var images []image_data
	var wg sync.WaitGroup

	c.OnHTML("table tbody", func(e *colly.HTMLElement) {
		fmt.Println("Found html")
		e.ForEach("tr", func(_ int, el *colly.HTMLElement) {
			pr := &press_release{}
			err := el.Unmarshal(pr)
			if err != nil {
				fmt.Println("Error unmarshalling:", err)
				return
			}
			//shitfucks don't have css selectors for seperating linebreaks
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

	c.OnHTML(".col-lg-9 > a:nth-child(7) > img:nth-child(1)", func(e *colly.HTMLElement) {
		fmt.Println("Found the image")
		imgSrc := e.Attr("src")
		pageUrl := e.Request.URL.String()
		images = append(images, image_data{page_url: pageUrl, image_url: imgSrc})

		// wg.Done() // Indicate that this goroutine has finished
	})

	err := c.Visit("https://www.moha.gov.np/en/page/press-release")
	if err != nil {
		fmt.Println("Error visiting:", err)
	}
	c.Wait()
	for _, pr := range press_releases {
		wg.Add(1)
		go func(url string) {
			defer wg.Done()
			c.Visit(url)
		}(pr.url)
	}

	wg.Wait()

	fmt.Println("Collected Press Releases:")
	for _, pr := range press_releases {
		fmt.Printf("Date: %s, Title: %s, URL: %s\n", pr.date, pr.title, pr.url)
	}

	fmt.Println("\nCollected Image URLs:")
	for _, img := range images {
		fmt.Printf("Page: %s, Image: %s\n", img.page_url, img.image_url)
	}

}
