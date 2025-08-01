import fs from "fs/promises";
import satori from "satori";
import sharp from "sharp";
import type { APIRoute } from "astro";

// Reusable styles
const styles = {
  title: {
    fontSize: "88px",
    fontFamily: "Source Serif 4",
    fontWeight: "bold",
    width: "100%",
    color: "#353534",
    lineHeight: "1.1",
    margin: "0",
  },
  description: {
    fontSize: "36px",
    fontFamily: "Noto Sans",
    fontWeight: "normal",
    width: "100%",
    color: "#4a4a46",
    marginTop: "20px",
    lineHeight: "1.33",
  },
  eyebrow: {
    fontSize: "16px",
    fontFamily: "Noto Sans",
    textTransform: "uppercase",
    color: "#5f023e",
    letterSpacing: "0.05em",
  },
  imageContainer: {
    position: "absolute",
    right: "56px",
    top: "64px",
    width: "400px",
    height: "400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

async function getImageData(imagePath: string) {
  try {
    // Read and process the image
    const imageBuffer = await fs.readFile(imagePath);
    const { width, height, format } = await sharp(imageBuffer).metadata();

    // Convert to base64
    const base64 = `data:image/${format};base64,${imageBuffer.toString("base64")}`;

    return { base64, width, height };
  } catch (error) {
    console.error("[OG] Error processing image:", error);
    return { base64: undefined, width: undefined, height: undefined };
  }
}

export const GET: APIRoute = async function get({ request }) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Tim Koval";
  const description =
    url.searchParams.get("description") ||
    "A digital garden is a dynamic space where I cultivate evolving notes, projects, and insights, fostering continuous growth and development";

  // Load the fonts
  // const SourceSerif4 = await (
  //   await fetch("https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHvxk.ttf")
  // ).arrayBuffer();
  // const Inter = await (
  //   await fetch("https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHvxk.ttf")
  // ).arrayBuffer();
  const SourceSerif4 = await fs.readFile("./public/fonts/source-serif-4-v13-latin-ext-regular.ttf");
  const NotoSans = await fs.readFile("./public/fonts/noto-sans-v39-latin-ext-regular.ttf");
  // const SourceSerif4 = await fs.readFile(
  //   "https://fonts.gstatic.com/s/sourceserif4/v13/vEFI2_tTDB4M7-auWDN0ahZJW1gV8te1Xb7GlMo.woff2",
  // );
  // const Inter = await (
  //   await fetch("https://fonts.gstatic.com/s/inter/v19/UcCo3FwrK3iLTcvsYwYZ8UA3J58.woff2")
  // ).arrayBuffer();

  // Load and process the garden cover image
  const {
    base64: coverImage,
    width,
    height,
  } = await getImageData("./src/images/covers/garden-cover@2x.png");

  // Calculate image dimensions
  let imageWidth = 440;
  let imageHeight = 440;
  if (width && height) {
    const aspectRatio = width / height;
    if (aspectRatio > 1) {
      imageHeight = Math.round(440 / aspectRatio);
    } else {
      imageWidth = Math.round(440 * aspectRatio);
    }
  }

  const content = {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f6f5f1",
        padding: "6px 20px 6px 28px",
        justifyContent: "space-between",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              padding: "64px 48px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    width: "55%",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                        },
                        children: [
                          {
                            type: "p",
                            props: {
                              style: styles.eyebrow,
                              children: "projects, notes, and chronicles",
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "h1",
                      props: {
                        style: styles.title,
                        children: title,
                      },
                    },
                    {
                      type: "p",
                      props: {
                        style: styles.description,
                        children: description,
                      },
                    },
                  ],
                },
              },
              coverImage && {
                type: "div",
                props: {
                  style: {
                    ...styles.imageContainer,
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                  },
                  children: {
                    type: "img",
                    props: {
                      src: coverImage,
                      width: imageWidth,
                      height: imageHeight,
                      style: {
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      },
                    },
                  },
                },
              },
            ].filter(Boolean),
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginTop: "auto",
            },
            children: [
              {
                type: "p",
                props: {
                  style: {
                    fontFamily: "Source Serif 4",
                    fontSize: "22px",
                    color: "#4a4a46",
                  },
                  children: "timkoval.rs",
                },
              },
              {
                type: "svg",
                props: {
                  width: "84",
                  height: "26",
                  viewBox: "0 0 84 26",
                  style: {
                    transform: "scale(0.8)",
                  },
                  children: [
                    {
                      type: "path",
                      props: {
                        d: "M65.3834 13.3217C65.3382 13.2801 65.3023 13.2301 65.2778 13.1748C65.2533 13.1196 65.2406 13.0602 65.2406 13.0001C65.2406 12.9401 65.2533 12.8807 65.2778 12.8254C65.3023 12.7701 65.3382 12.7202 65.3834 12.6785C70.1523 8.29756 79.0817 8.29079 83.8578 12.6785C83.9027 12.7196 83.9385 12.769 83.963 12.8237C83.9874 12.8784 84 12.9373 84 12.9967C84 13.0562 83.9874 13.1151 83.963 13.1698C83.9385 13.2245 83.9027 13.2739 83.8578 13.315C79.1171 17.7095 70.1948 17.7095 65.3834 13.3217Z",
                        fill: "#04A4BA",
                      },
                    },
                    {
                      type: "path",
                      props: {
                        d: "M61.3928 12.6918C64.2438 11.914 66.7719 10.3078 68.6275 8.09525C70.4832 5.88276 71.5748 3.17325 71.7515 0.34127C71.7551 0.294157 71.7477 0.246865 71.7298 0.202843C71.7119 0.15882 71.684 0.119168 71.6481 0.086753C71.6121 0.0543379 71.5692 0.0299785 71.5222 0.0154419C71.4752 0.000905236 71.4255 -0.00344117 71.3765 0.00271291C68.1433 0.440409 65.1934 2.00681 63.0943 4.40057C60.9952 6.79432 59.8953 9.84633 60.006 12.9695L60.006 13.0304C59.8925 16.1563 60.9933 19.2116 63.0958 21.6063C65.1984 24.0011 68.1535 25.5653 71.3907 25.9971C71.439 26.0031 71.4881 25.9989 71.5345 25.9848C71.5809 25.9706 71.6235 25.9469 71.6593 25.9152C71.6951 25.8836 71.7232 25.8448 71.7415 25.8016C71.7599 25.7584 71.7682 25.7119 71.7657 25.6654C71.5884 22.8308 70.495 20.1189 68.6367 17.9051C66.7784 15.6912 64.247 14.0848 61.3928 13.308C61.3215 13.2903 61.2583 13.2505 61.2132 13.1947C61.1681 13.139 61.1436 13.0705 61.1436 12.9999C61.1436 12.9294 61.1681 12.8609 61.2132 12.8051C61.2583 12.7494 61.3215 12.7095 61.3928 12.6918V12.6918Z",
                        fill: "#04A4BA",
                      },
                    },
                    {
                      type: "path",
                      props: {
                        d: "M18.6166 12.6781C18.6618 12.7198 18.6977 12.7698 18.7222 12.825C18.7467 12.8803 18.7594 12.9397 18.7594 12.9997C18.7594 13.0598 18.7467 13.1192 18.7222 13.1745C18.6977 13.2297 18.6618 13.2797 18.6166 13.3214C13.8477 17.7023 4.91825 17.7091 0.14222 13.3214C0.0972693 13.2803 0.0614926 13.2309 0.0370483 13.1762C0.012604 13.1215 4.41993e-08 13.0626 4.49407e-08 13.0031C4.5682e-08 12.9436 0.012604 12.8848 0.0370483 12.8301C0.0614926 12.7754 0.0972693 12.726 0.14222 12.6849C4.88287 8.29041 13.8052 8.29043 18.6166 12.6781Z",
                        fill: "#04A4BA",
                      },
                    },
                    {
                      type: "path",
                      props: {
                        d: "M22.6072 13.308C19.7562 14.0859 17.2281 15.6921 15.3725 17.9046C13.5168 20.1171 12.4252 22.8266 12.2485 25.6586C12.2449 25.7057 12.2523 25.753 12.2702 25.797C12.2881 25.8411 12.316 25.8807 12.3519 25.9131C12.3879 25.9455 12.4308 25.9699 12.4778 25.9844C12.5248 25.999 12.5745 26.0033 12.6235 25.9972C15.8567 25.5595 18.8066 23.9931 20.9057 21.5993C23.0048 19.2056 24.1047 16.1535 23.994 13.0304L23.994 12.9695C24.1075 9.84357 23.0067 6.78826 20.9042 4.39353C18.8016 1.99881 15.8465 0.43453 12.6093 0.00274453C12.561 -0.00326796 12.5119 0.000947518 12.4655 0.0151015C12.4191 0.0292556 12.3765 0.0529844 12.3407 0.0846356C12.3049 0.116287 12.2768 0.155087 12.2585 0.198266C12.2401 0.241446 12.2318 0.28796 12.2343 0.334524C12.4116 3.16912 13.505 5.88094 15.3633 8.09479C17.2216 10.3086 19.753 11.9151 22.6072 12.6919C22.6785 12.7095 22.7417 12.7494 22.7868 12.8051C22.8319 12.8609 22.8564 12.9294 22.8564 12.9999C22.8564 13.0705 22.8319 13.139 22.7868 13.1948C22.7417 13.2505 22.6785 13.2904 22.6072 13.308V13.308Z",
                        fill: "#04A4BA",
                      },
                    },
                    {
                      type: "path",
                      props: {
                        d: "M47.6457 25.9301C48.8006 23.3006 49.2839 21.8104 49.2839 18.1865V4.97214L40.0588 25.2198H38.6539L30.0386 5.527L30.1509 18.0095C30.1875 21.6307 31.1935 23.1934 33.5398 25.9301L32.6968 25.9998H25.1661L25.0902 25.9301C27.0572 23.1934 27.8468 21.7031 27.8468 17.972V6.92615C27.8468 3.58639 27.0263 2.30782 24.9048 0.0696928V0H34.1411L41.2671 15.2594L48.3173 0H58.8658V0.0696928C56.7809 2.30782 55.9604 3.58639 55.9604 6.92615V18.2213C55.9604 21.738 56.4465 23.3006 57.5621 25.9301V25.9998H47.6457V25.9301Z",
                        fill: "#680040",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
 
  const svg = await satori(content, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Source Serif 4",
        data: SourceSerif4,
        weight: 400,
        style: "normal",
      },
      {
        name: "Noto Sans",
        data: NotoSans,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
