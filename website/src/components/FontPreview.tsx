import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Code,
  Divider,
  Heading,
  Input,
  Link,
  Select,
  SimpleGrid,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineFontSize } from "react-icons/ai";

import { MetadataProps } from "../@types/[font]";
import useFontDownload from "../hooks/useFontDownload";
import {
  findClosestStyle,
  findClosestWeight,
  fontsourceDownload,
} from "../utils/fontsourceUtils";
import { NextChakraLink } from "./NextChakraLink";

interface FontPreviewProps {
  defPreviewText: string;
  metadata: MetadataProps;
}

export const FontPreview = ({ defPreviewText, metadata }: FontPreviewProps) => {
  const { isFallback, events } = useRouter();

  const [fontSize, setFontSize] = useState(32);

  const [previewText, setPreviewText] = useState(defPreviewText);
  const defWeight = findClosestWeight(metadata.weights);
  const [weight, setWeight] = useState(defWeight);

  const defStyle = findClosestStyle(metadata.styles);
  const [style, setStyle] = useState(defStyle);
  // Return states back to defaults when switching pages, else changed weight will remain
  useEffect(() => {
    events.on("routeChangeStart", () => {
      setStyle(defStyle);
      setWeight(defWeight);
      // Figure out bug that doesn't load different preview texts unless page is reloaded
      setPreviewText(defPreviewText);
    });
  }, [events, defPreviewText, defStyle, defWeight]);

  const downloadLink = fontsourceDownload.fontDownload(
    metadata.fontId,
    metadata.defSubset,
    weight,
    style
  );

  const fontLoaded = useFontDownload(metadata, downloadLink);

  const bgSlider = useColorModeValue("gray.200", "gray.700");
  const bgSliderFilled = useColorModeValue("black", "white");

  return (
    <>
      <Box>
        <Heading size="2xl">{metadata.fontName}</Heading>
        <Divider mt={1} />
      </Box>

      <SimpleGrid spacing={2} columns={{ md: 1, lg: 2 }}>
        <Select
          value={weight}
          onChange={(event) => setWeight(+event.target.value)}
        >
          {metadata.weights.map((weight) => (
            <option key={`${metadata.fontId}-${weight}`} value={weight}>
              {weight}
            </option>
          ))}
        </Select>
        <Select
          value={style}
          onChange={(event) => setStyle(event.target.value)}
        >
          {metadata.styles.map((style) => (
            <option key={`${metadata.fontId}-${style}`} value={style}>
              {style}
            </option>
          ))}
        </Select>
      </SimpleGrid>

      <Skeleton width="100%" isLoaded={fontLoaded && !isFallback}>
        <Input
          value={previewText}
          onChange={(event) => setPreviewText(event.target.value)}
          variant="flushed"
          style={{
            fontFamily: metadata.fontName,
            fontSize: `${fontSize}px`,
            fontWeight: weight,
          }}
          height={`${fontSize + 12}px`}
        />
      </Skeleton>

      <Slider
        aria-label="slider-font-size"
        min={8}
        max={200}
        defaultValue={32}
        onChange={(value) => setFontSize(value)}
      >
        <SliderTrack bg={bgSlider}>
          <SliderFilledTrack bg={bgSliderFilled} />
        </SliderTrack>
        <SliderThumb boxSize={6}>
          <Box color="black" as={AiOutlineFontSize} />
        </SliderThumb>
      </Slider>
      <Box>
        <Heading mt={2}>Quick Installation</Heading>
        <Divider mt={1} />
      </Box>
      <Text>
        Fontsource has a variety of methods to import CSS, such as using a
        bundler like Webpack. Full documentation can be found{" "}
        <NextChakraLink
          prefetch={false}
          href="/docs/getting-started"
          borderBottom="1px dotted"
          _hover={{ textDecoration: "none" }}
        >
          here
        </NextChakraLink>
        .
      </Text>
      <Code>yarn add @fontsource/{metadata.fontId}</Code>
      <Code>import &quot;@fontsource/{metadata.fontId}.css&quot;</Code>
      <Code>body &#123; font-family: &quot;Open Sans&quot;; &#125;</Code>
      {metadata.variable && (
        <>
          <Box>
            <Heading mt={2}>Variable</Heading>
            <Divider mt={1} />
          </Box>
          <Text>
            This font supports the variable font specification. You can find all
            the available variable axis&apos;{" "}
            <Link
              href="https://fonts.google.com/variablefonts"
              isExternal
              mr="auto"
            >
              here <ExternalLinkIcon />
            </Link>
            .
          </Text>
          <Text>
            To see how Fontsource integrates with variable fonts, check the{" "}
            <NextChakraLink
              prefetch={false}
              href="/docs/variable-fonts"
              borderBottom="1px dotted"
              _hover={{ textDecoration: "none" }}
            >
              documentation
            </NextChakraLink>
            .
          </Text>
        </>
      )}
      <Box>
        <Heading mt={2}>Licensing</Heading>
        <Divider mt={1} />
      </Box>
      <Text>
        It is important to always read the license for every font that you use.
        Most of the fonts in the collection use the SIL Open Font License, v1.1.
        Some fonts use the Apache 2 license. The Ubuntu fonts use the Ubuntu
        Font License v1.0.
      </Text>
      <SimpleGrid columns={{ md: 1, lg: 2 }}>
        <Link href={metadata.source} isExternal mr="auto" fontWeight="700">
          <Button variant="ghost" rightIcon={<ExternalLinkIcon />}>
            Source
          </Button>
        </Link>
        <Link href={metadata.license} isExternal mr="auto" fontWeight="700">
          <Button variant="ghost" rightIcon={<ExternalLinkIcon />}>
            License
          </Button>
        </Link>
      </SimpleGrid>
      <Box>
        <Heading mt={2}>Other Notes</Heading>
        <Divider mt={1} />
      </Box>
      <Text>Font version (provided by source): {metadata.version}</Text>
      <Text>
        Feel free to star and contribute new ideas to this repository that aim
        to improve the performance of font loading, as well as expanding the
        existing library we already have. Any suggestions or ideas can be voiced
        via an{" "}
        <Link href="https://github.com/fontsource/fontsource/issues" isExternal>
          issue <ExternalLinkIcon />
        </Link>
        .
      </Text>
    </>
  );
};