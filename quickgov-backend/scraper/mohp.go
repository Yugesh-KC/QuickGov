package scraper

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"quickgov-backend/handler"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly"
)

type PressRelease struct {
	date  string `selector:"p:nth-child(2) > span:nth-child(1)"`
	title string `selector:"a:nth-child(1)"`
	url   string `selector:"a:nth-child(1)[href]" attr:"href"`
}

type ImageData struct {
	page_url  string
	image_url string
}

func RunScraperMOHP() {
	baseURL := "https://mohp.gov.np"

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

	c.OnHTML("div.news-lists", func(e *colly.HTMLElement) {
		e.ForEach("div:nth-child(2)", func(_ int, el *colly.HTMLElement) {
			pr := &PressRelease{}
			err := el.Unmarshal(pr)
			if err != nil {
				fmt.Println("Error unmarshalling:", err)
				return
			}
			full_title := el.ChildText("a:nth-child(1)")
			lines := strings.Split(full_title, "\n")
			if len(lines) > 0 {
				pr.title = strings.TrimSpace(lines[0])
			}
			pr.date = el.ChildText("p:nth-child(2) > span:nth-child(1)")
			var url string = el.ChildAttr("a:nth-child(1)", "href")
			if strings.HasPrefix(url, "/") {
				pr.url = fmt.Sprintf("%s%s", baseURL, url)

			} else {
				pr.url = fmt.Sprintf("%s/%s", baseURL, url)
			}
			pr.date, err = FormatDate(pr.date)
			if err != nil {
				return
			}
			PressReleases = append(PressReleases, *pr)
		})
	})

	startURL := "https://mohp.gov.np/news/press-release/en?page="
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

			imageCollector.OnHTML(".pic-content > a:nth-child(1)", func(e *colly.HTMLElement) {
				imgSrc := e.Attr("href")
				imgSrc = fmt.Sprintf("%s%s", baseURL, imgSrc)

				pageUrl := e.Request.URL.String()

				if imgSrc != "" {
					images = append(images, ImageData{page_url: pageUrl, image_url: imgSrc})
					pr.url = imgSrc
					return
				}
			})

			// imageCollector.OnHTML(".table > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)", func(e *colly.HTMLElement) {
			// 	link := e.Attr("href")
			// 	pageUrl := e.Request.URL.String()
			// 	if link != "" {
			// 		images = append(images, ImageData{page_url: pageUrl, image_url: link})
			// 		pr.url = link
			// 	}
			// })

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
		filename := saveImage(pr.url, fmt.Sprintf("scraped-images/mohp/%s", strings.ReplaceAll(pr.date, " ", "_")), "scraped-images/mohp")
		fmt.Printf(filename)
		handler.SaveScraped(pr.date, pr.title, filename, "mohp")
	}
}

func saveImage(url string, baseFilename string, dirName string) string {

	os.MkdirAll(dirName, os.ModePerm)
	ext := filepath.Ext(url)
	if ext == "" {
		resp, err := http.Head(url)
		if err != nil || resp.StatusCode != http.StatusOK {
			fmt.Println("Error checking URL:", url)
			return ""
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
			return ""
		}
	}

	filename := fmt.Sprintf("%s%s", baseFilename, ext)
	out, err := os.Create(filename)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return ""
	}
	defer out.Close()

	response, err := http.Get(url)
	if err != nil {
		fmt.Println("Error downloading file:", err)
		return ""
	}
	defer response.Body.Close()

	_, err = io.Copy(out, response.Body)
	if err != nil {
		fmt.Println("Error saving file:", err)
		return ""
	}

	fmt.Printf("File saved to %s\n", filename)
	return filename
}

func FormatDate(inputDate string) (string, error) {
	layout := "Mon, 02 Jan 2006"
	gregorianDate, err := time.Parse(layout, inputDate)
	if err != nil {
		return "", err
	}
	outputDate := gregorianDate.Format("2006-01-02")
	return outputDate, nil
}
