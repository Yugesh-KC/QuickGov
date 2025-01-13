package scraper

import (
	"fmt"
	"quickgov-backend/handler"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly"
)

func RunScraperMOHA() {
	c := colly.NewCollector(colly.Async(true), colly.CacheDir("./colly_cache"))
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 3,
		Delay:       2 * time.Second,
		RandomDelay: 500 * time.Millisecond,
	})

	var PressReleases []PressRelease
	var images []ImageData
	var wg sync.WaitGroup

	c.OnHTML("table tbody", func(e *colly.HTMLElement) {
		e.ForEach("tr", func(_ int, el *colly.HTMLElement) {
			pr := &PressRelease{}
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
			PressReleases = append(PressReleases, *pr)
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

	for _, pr := range PressReleases {
		wg.Add(1)
		go func(pr PressRelease) {
			defer wg.Done()

			imageCollector := colly.NewCollector()

			imageCollector.OnHTML(".col-lg-9 > a:nth-child(7) > img:nth-child(1)", func(e *colly.HTMLElement) {
				imgSrc := e.Attr("src")
				pageUrl := e.Request.URL.String()
				if imgSrc != "" {
					images = append(images, ImageData{page_url: pageUrl, image_url: imgSrc})
					pr.url = imgSrc
					return
				}
			})

			imageCollector.OnHTML(".table > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)", func(e *colly.HTMLElement) {
				link := e.Attr("href")
				pageUrl := e.Request.URL.String()
				if link != "" {
					images = append(images, ImageData{page_url: pageUrl, image_url: link})
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
	// for _, pr := range PressReleases {
	// 	fmt.Printf("Date: %s, Title: %s, URL: %s\n", pr.date, pr.title, pr.url)
	// }

	fmt.Println("\nCollected Image URLs:")
	for _, img := range images {
		// fmt.Printf("Page: %s, Image: %s\n", img.page_url, img.image_url)

		for i := range PressReleases {
			if PressReleases[i].url == img.page_url {
				PressReleases[i].url = img.image_url
			}
		}
	}

	fmt.Println("\nCollected Data:")
	for _, pr := range PressReleases {
		fmt.Printf("Date: %s, Title: %s,  URL: %s\n", pr.date, pr.title, pr.url)
		filename := saveImage(pr.url, fmt.Sprintf("scraped-images/moha/%s", strings.ReplaceAll(pr.date, " ", "_")), "scraped-images/moha")
		handler.SaveScraped(pr.date, pr.title, filename, "moha")
	}
}
